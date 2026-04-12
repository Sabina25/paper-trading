import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getAllPrices } from '../services/marketData';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/assets
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prices = await getAllPrices();
    if (prices.length > 0) {
      res.json(prices);
      return;
    }
    const assets = await prisma.asset.findMany({ orderBy: { symbol: 'asc' } });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/assets/stream — SSE live prices
router.get('/stream', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendPrices = async () => {
    const prices = await getAllPrices();
    res.write(`data: ${JSON.stringify(prices)}\n\n`);
  };

  await sendPrices();

  // Push every 5 seconds (data from Redis, Finnhub updates every 60s)
  const interval = setInterval(sendPrices, 5000);

  _req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;