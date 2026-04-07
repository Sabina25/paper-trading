import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Расширяем тип Request чтобы можно было хранить userId
export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Токен приходит в заголовке: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = decoded.userId;
    next(); // всё ок — передаём управление дальше
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};