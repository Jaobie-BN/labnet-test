import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const SECRET_KEY = process.env.JWT_SECRET || 'fallback-secret-key';
const EXPIRES_IN = '1d'; // Token validity duration

interface UserPayload {
  id: string;
  email: string;
  role: string;
  name?: string;
  [key: string]: any;
}

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token: string): string | jwt.JwtPayload => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
