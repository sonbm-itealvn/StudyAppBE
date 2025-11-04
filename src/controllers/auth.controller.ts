// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ClassModel } from '../models/Class';
import { env } from '../configs/env';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { email, password, fullName, classId } = req.body || {};
    if (!email || !password || !fullName)
      return res.status(400).json({ message: 'Thiếu dữ liệu' });

    if (classId) {
      const cls = await ClassModel.findById(classId);
      if (!cls) return res.status(400).json({ message: 'classId không hợp lệ' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email đã tồn tại' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, fullName, classId });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ accessToken: token });
  }

  static async login(req: Request, res: Response) {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: 'Thiếu dữ liệu' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Sai thông tin đăng nhập' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: 'Sai thông tin đăng nhập' });

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ accessToken: token });
  }
}
