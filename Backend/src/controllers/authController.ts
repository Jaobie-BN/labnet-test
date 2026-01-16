import { Request, Response } from 'express';
import { findUserByEmail, User } from '../services/userService';
import { authenticateWithLdap } from '../services/ldapService';
import { generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Check if it's a KMITL email -> Use LDAP
    if (email.endsWith('@kmitl.ac.th')) {
      try {
        const ldapUser = await authenticateWithLdap(email, password);
        
        if (ldapUser) {
           // LDAP Success. Now link to local role/user data if it exists.
           const localUser = findUserByEmail(email);
           
           // Default role if not in local DB
           const role = localUser?.role || 'student';
           const name = localUser?.name || ldapUser.cn || email.split('@')[0];
           const id = localUser?.id || 'ldap-' + Date.now();

           const token = generateToken({ id, email, name, role });

           return res.status(200).json({
             success: true,
             token,
             user: {
               id,
               email,
               name,
               role
             }
           });
        }
      } catch (error) {
        console.error('LDAP Auth Failed:', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password'
        });
      }
    }

    // 2. Non-KMITL Email -> Use Local Database Auth
    const user = findUserByEmail(email);

    if (user && user.password === password) {
        const { password, ...userWithoutPassword } = user;
        const token = generateToken({ ...userWithoutPassword });
        
        return res.status(200).json({
        success: true,
        token,
        user: userWithoutPassword
        });
    }

    // 3. Fail
    return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
    });

  } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
          success: false,
          message: 'Internal server error'
      });
  }
};
