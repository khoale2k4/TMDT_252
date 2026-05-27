import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

export class AuthController {
  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Vui lòng nhập email và mật khẩu' } });
        return;
      }

      const userRecord = await prisma.user.findUnique({
        where: { email }
      });

      if (!userRecord) {
        res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Tài khoản không tồn tại' } });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, userRecord.password);
      if (!isValidPassword) {
        res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Mật khẩu không chính xác' } });
        return;
      }

      const token = jwt.sign(
        { id: userRecord.id, email: userRecord.email, role: userRecord.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      res.status(200).json({
        data: {
          token,
          user: { id: userRecord.id, email: userRecord.email, name: userRecord.full_name, role: userRecord.role }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, full_name, phone } = req.body;

      if (!email || !password || !full_name) {
        res.status(400).json({ error: { code: 'MISSING_FIELDS', message: 'Vui lòng điền đầy đủ thông tin' } });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: { code: 'USER_EXISTS', message: 'Email đã được đăng ký' } });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          full_name,
          phone: phone || null
        }
      });

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        data: {
          token,
          user: { id: newUser.id, email: newUser.email, name: newUser.full_name, role: newUser.role }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
