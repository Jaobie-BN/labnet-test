import { Request, Response } from 'express';
import { findUserByEmail } from '../services/userService';

export const login = (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = findUserByEmail(email);

  if (user && user.password === password) {
    // Determine status (Simulate token generation)
    const token = 'mock-jwt-token-' + Date.now();
    
    // Return user info and token (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    return res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Invalid email or password'
  });
};
