import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export interface AuthRequest extends Request {
  admin?: {
    id: string;
    username: string;
    name: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

export const generateToken = (admin: { id: string; username: string; name: string }): string => {
  return jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      name: admin.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
