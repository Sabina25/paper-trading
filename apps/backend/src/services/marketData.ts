import prisma from '../lib/prisma';
import redis from '../lib/redis';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Our tracked assets
const ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NFLX', name: 'Netflix Inc.' },
];

// Fetch real price from Finnhub
async function fetchPrice(symbol: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${FINNHUB_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );
    const data = await res.json() as { c: number };
    // Finnhub returns { c: currentPrice, h: high, l: low, o: open, pc: prevClose }
    if (data.c && data.c > 0) {
      return parseFloat(data.c.toFixed(2));
    }
    return null;
  } catch (err) {
    console.error(`Failed to fetch price for ${symbol}:`, err);
    return null;
  }
}

// Create assets in DB on startup if they don't exist
export async function seedAssets(): Promise<void> {
  for (const asset of ASSETS) {
    const existing = await prisma.asset.findUnique({ where: { symbol: asset.symbol } });
    if (!existing) {
      await prisma.asset.create({
        data: {
          symbol: asset.symbol,
          name: asset.name,
          price: 0,
        },
      });
    }
  }
  console.log('Assets seeded');
}

// Fetch and update all prices from Finnhub
export async function updatePrices(): Promise<void> {
  console.log('Fetching real prices from Finnhub...');

  for (const asset of ASSETS) {
    const price = await fetchPrice(asset.symbol);

    if (!price) {
      console.warn(`No price returned for ${asset.symbol}, skipping`);
      continue;
    }

    // Update PostgreSQL
    await prisma.asset.update({
      where: { symbol: asset.symbol },
      data: { price },
    });

    // Update Redis for fast access
    await redis.set(
      `price:${asset.symbol}`,
      JSON.stringify({
        symbol: asset.symbol,
        name: asset.name,
        price,
        updatedAt: new Date().toISOString(),
      })
    );

    console.log(`${asset.symbol}: $${price}`);
  }
}

// Get single price from Redis
export async function getPrice(symbol: string): Promise<number | null> {
  const data = await redis.get(`price:${symbol}`);
  if (!data) return null;
  return JSON.parse(data).price;
}

// Get all prices from Redis
export async function getAllPrices(): Promise<Record<string, any>[]> {
  const prices = [];
  for (const asset of ASSETS) {
    const data = await redis.get(`price:${asset.symbol}`);
    if (data) prices.push(JSON.parse(data));
  }
  return prices;
}

// Start price updater — fetch from Finnhub every 60 seconds
export function startPriceUpdater(): void {
  // Fetch immediately on startup
  updatePrices().catch(console.error);

  // Then every 60 seconds
  setInterval(async () => {
    try {
      await updatePrices();
    } catch (err) {
      console.error('Price update error:', err);
    }
  }, 60000);

  console.log('Price updater started (Finnhub, every 60s)');
}