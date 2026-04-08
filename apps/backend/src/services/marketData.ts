import prisma from '../lib/prisma';
import redis from '../lib/redis';

// Список акций с начальными ценами
const INITIAL_ASSETS = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.00 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.00 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 140.00 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.00 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 185.00 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.00 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 505.00 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 635.00 },
];

// Создаём акции в БД при старте сервера
// upsert = создай если нет, обнови если есть
export async function seedAssets(): Promise<void> {
  for (const asset of INITIAL_ASSETS) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: {},  // если акция уже есть — ничего не меняем
      create: {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
      },
    });
  }
  console.log('Assets seeded');
}

// Случайно меняем цену от -1% до +1%
// Это имитирует колебания рынка
function randomPriceChange(currentPrice: number): number {
  const changePercent = (Math.random() - 0.5) * 0.02;
  const newPrice = currentPrice * (1 + changePercent);
  return Math.max(1, parseFloat(newPrice.toFixed(2))); // минимум $1
}

// Обновляем цены всех акций
export async function updatePrices(): Promise<void> {
  const assets = await prisma.asset.findMany();

  for (const asset of assets) {
    const newPrice = randomPriceChange(Number(asset.price));

    // Сохраняем новую цену в PostgreSQL
    await prisma.asset.update({
      where: { id: asset.id },
      data: { price: newPrice },
    });

    // Сохраняем в Redis для быстрого доступа
    // redis.set(ключ, значение) — просто как словарь
    await redis.set(
      `price:${asset.symbol}`,  // ключ, например: "price:AAPL"
      JSON.stringify({
        symbol: asset.symbol,
        name: asset.name,
        price: newPrice,
        updatedAt: new Date().toISOString(),
      })
    );
  }
}

// Получить цену одной акции из Redis
export async function getPrice(symbol: string): Promise<number | null> {
  const data = await redis.get(`price:${symbol}`);
  if (!data) return null;
  return JSON.parse(data).price;
}

// Получить цены всех акций из Redis
export async function getAllPrices(): Promise<Record<string, any>[]> {
  const assets = await prisma.asset.findMany({ select: { symbol: true } });
  const prices = [];

  for (const asset of assets) {
    const data = await redis.get(`price:${asset.symbol}`);
    if (data) prices.push(JSON.parse(data));
  }

  return prices;
}

// Запускаем автоматическое обновление цен каждые 3 секунды
export function startPriceUpdater(): void {
  setInterval(async () => {
    try {
      await updatePrices();
    } catch (err) {
      console.error('Price update error:', err);
    }
  }, 3000);

  console.log('Price updater started (every 3s)');
}