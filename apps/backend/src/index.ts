import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import assetsRouter from './routes/assets';
import portfolioRouter from './routes/portfolio';
import { seedAssets, startPriceUpdater } from './services/marketData';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/assets', assetsRouter);
app.use('/api/portfolio', portfolioRouter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

async function bootstrap() {
  await seedAssets();
  startPriceUpdater();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

bootstrap().catch(console.error);