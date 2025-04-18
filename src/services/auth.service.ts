import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import { AppError } from '../utils/error.util';
import { UserInstance } from '../types/user.types';

export const login = async (username: string, password: string): Promise<string> => {
  const user: UserInstance | null = await User.findOne({ where: { username } }) as UserInstance | null;
  if (!user) throw new AppError('User not found', 404);
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new AppError('Invalid credentials', 401);
  const token = jwt.sign(
    { user_id: user.user_id, school_id: user.school_id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
  return token;
};