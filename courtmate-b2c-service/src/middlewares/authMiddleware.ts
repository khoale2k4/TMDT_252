import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Vui lòng đăng nhập' } });
    return;
  }

  
  if (token === 'dev-token-123') {
    // Giả lập dữ liệu đã decode từ JWT
    (req as any).user = { 
      id: '11111111-1111-1111-1111-111111111111',
      email: 'dev@test.com' 
    };
    return next(); // Cho phép đi tiếp vào SlotController
  }

  // Logic kiểm tra Token thật
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    (req as any).user = decoded; 
    next();
  } catch (error) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Token không hợp lệ hoặc đã hết hạn' } });
  }
};