import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getPrice } from '../services/marketData';
import prisma from '../lib/prisma';

const router = Router();

router.use(authMiddleware);

// GET /api/portfolio
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await prisma.account.findUnique({
      where: { userId: req.userId! },
      include: {
        positions: {
          include: { asset: true },
        },
      },
    });

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const positionsWithPnl = await Promise.all(
      account.positions.map(async (position) => {
        const currentPrice = await getPrice(position.asset.symbol) || Number(position.asset.price);
        const avgPrice = Number(position.avgPrice);
        const quantity = Number(position.quantity);
        const unrealizedPnl = (currentPrice - avgPrice) * quantity;
        const marketValue = currentPrice * quantity;

        return {
          id: position.id,
          symbol: position.asset.symbol,
          name: position.asset.name,
          quantity,
          avgPrice,
          currentPrice,
          marketValue: parseFloat(marketValue.toFixed(2)),
          unrealizedPnl: parseFloat(unrealizedPnl.toFixed(2)),
        };
      })
    );

    const totalMarketValue = positionsWithPnl.reduce((sum, p) => sum + p.marketValue, 0);
    const totalEquity = Number(account.balance) + totalMarketValue;
    const totalUnrealizedPnl = positionsWithPnl.reduce((sum, p) => sum + p.unrealizedPnl, 0);

    res.json({
      balance: Number(account.balance),
      totalEquity: parseFloat(totalEquity.toFixed(2)),
      totalUnrealizedPnl: parseFloat(totalUnrealizedPnl.toFixed(2)),
      positions: positionsWithPnl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/portfolio/order
router.post('/order', async (req: AuthRequest, res: Response): Promise<void> => {
  const { symbol, side, quantity } = req.body;

  if (!symbol || !side || !quantity) {
    res.status(400).json({ error: 'symbol, side, quantity are required' });
    return;
  }

  if (!['BUY', 'SELL'].includes(side)) {
    res.status(400).json({ error: 'side must be BUY or SELL' });
    return;
  }

  if (quantity <= 0) {
    res.status(400).json({ error: 'quantity must be positive' });
    return;
  }

  try {
    const currentPrice = await getPrice(symbol);
    if (!currentPrice) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const asset = await prisma.asset.findUnique({ where: { symbol } });
    if (!asset) {
      res.status(404).json({ error: 'Asset not found' });
      return;
    }

    const account = await prisma.account.findUnique({
      where: { userId: req.userId! },
    });

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const totalCost = currentPrice * quantity;

    const order = await prisma.$transaction(async (tx: any) => {
      if (side === 'BUY') {
        if (Number(account.balance) < totalCost) {
          throw new Error('Insufficient balance');
        }

        await tx.account.update({
          where: { id: account.id },
          data: { balance: { decrement: totalCost } },
        });

        const existingPosition = await tx.position.findUnique({
          where: { accountId_assetId: { accountId: account.id, assetId: asset.id } },
        });

        if (existingPosition) {
          const oldQty = Number(existingPosition.quantity);
          const oldAvg = Number(existingPosition.avgPrice);
          const newQty = oldQty + quantity;
          const newAvg = (oldQty * oldAvg + quantity * currentPrice) / newQty;

          await tx.position.update({
            where: { id: existingPosition.id },
            data: {
              quantity: newQty,
              avgPrice: parseFloat(newAvg.toFixed(2)),
            },
          });
        } else {
          await tx.position.create({
            data: {
              accountId: account.id,
              assetId: asset.id,
              quantity,
              avgPrice: currentPrice,
            },
          });
        }
      } else {
        const position = await tx.position.findUnique({
          where: { accountId_assetId: { accountId: account.id, assetId: asset.id } },
        });

        if (!position || Number(position.quantity) < quantity) {
          throw new Error('Insufficient shares');
        }

        await tx.account.update({
          where: { id: account.id },
          data: { balance: { increment: totalCost } },
        });

        const newQty = Number(position.quantity) - quantity;

        if (newQty === 0) {
          await tx.position.delete({ where: { id: position.id } });
        } else {
          await tx.position.update({
            where: { id: position.id },
            data: { quantity: newQty },
          });
        }
      }

      return tx.order.create({
        data: {
          accountId: account.id,
          assetId: asset.id,
          type: 'MARKET',
          side,
          quantity,
          price: currentPrice,
          status: 'FILLED',
        },
      });
    });

    res.status(201).json({
      message: `${side} order executed`,
      order: {
        id: order.id,
        symbol,
        side,
        quantity,
        price: currentPrice,
        total: parseFloat(totalCost.toFixed(2)),
      },
    });
  } catch (error: any) {
    if (error.message === 'Insufficient balance' || error.message === 'Insufficient shares') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/portfolio/orders
router.get('/orders', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const account = await prisma.account.findUnique({
      where: { userId: req.userId! },
    });

    if (!account) {
      res.status(404).json({ error: 'Account not found' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { accountId: account.id },
      include: { asset: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      orders.map((order) => ({
        id: order.id,
        symbol: order.asset.symbol,
        name: order.asset.name,
        side: order.side,
        quantity: Number(order.quantity),
        price: Number(order.price),
        total: parseFloat((Number(order.quantity) * Number(order.price)).toFixed(2)),
        status: order.status,
        createdAt: order.createdAt,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;