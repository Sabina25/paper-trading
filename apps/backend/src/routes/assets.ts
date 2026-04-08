import { Router, Response, Request } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { getAllPrices } from '../services/marketData';
import prisma from '../lib/prisma';
import redis from '../lib/redis';

const router = Router();

// GET /api/assets — list of all assets
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

// GET /api/assets/stream — SSE stream of live prices
// This keeps a persistent connection open and pushes price updates
router.get('/stream', authMiddleware, async (_req: AuthRequest, res: Response): Promise<void> => {
  // Set SSE headers — this tells the browser to keep connection open
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send current prices immediately on connect
  const sendPrices = async () => {
    const prices = await getAllPrices();
    // SSE format: "data: {...}\n\n"
    res.write(`data: ${JSON.stringify(prices)}\n\n`);
  };

  await sendPrices();

  // Push new prices every 3 seconds
  const interval = setInterval(sendPrices, 3000);

  // Clean up when client disconnects
  _req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;