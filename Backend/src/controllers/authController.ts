import { Request, Response } from 'express';
import { findUserByEmail, findOrCreateLdapUser, updateLastLogin, User } from '../services/userService';
import { authenticateWithLdap } from '../services/ldapService';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Check if it's a KMITL email -> Use LDAP
    if (email.endsWith('@kmitl.ac.th')) {
      try {
        const ldapUser = await authenticateWithLdap(email, password);
        
        if (ldapUser) {
          // LDAP Success - Use findOrCreateLdapUser for auto-registration
          const user = findOrCreateLdapUser({
            email: email,
            name: ldapUser.cn || email.split('@')[0]
          });

          const token = generateToken({ 
            id: user.id, 
            email: user.email, 
            name: user.name, 
            role: user.role 
          });

          return res.status(200).json({
            success: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              authType: user.auth_type
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

    if (user && user.password && await bcrypt.compare(password, user.password)) {
      // Update last login
      updateLastLogin(user.id);
      
      const { password: _, ...userWithoutPassword } = user;
      const token = generateToken({ 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      });
      
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          authType: user.auth_type
        }
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
