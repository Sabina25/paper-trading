import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getAllPrices } from '../services/marketData';
import prisma from '../lib/prisma';

const router = Router();

// GET /api/assets — список всех акций с текущими ценами
router.get('/', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Сначала пробуем взять из Redis — это быстро
    const prices = await getAllPrices();

    if (prices.length > 0) {
      res.json(prices);
      return;
    }

    // Если Redis ещё пустой — берём из PostgreSQL
    const assets = await prisma.asset.findMany({
      orderBy: { symbol: 'asc' },
    });

    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
