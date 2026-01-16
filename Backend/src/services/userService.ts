import db from '../database/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export interface User {
  id: string;
  email: string;
  password: string | null;
  name: string;
  role: string;
  auth_type: string;
  last_login: string | null;
  created_at: string;
}

export interface UserWithoutPassword {
  id: string;
  email: string;
  name: string;
  role: string;
  authType: string;
  lastLogin: string | null;
  createdAt: string;
}

// Find user by email
export const findUserByEmail = (email: string): User | undefined => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as User | undefined;
  return user;
};

// Find user by ID  
export const findUserById = (id: string): User | undefined => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
};

// Get all users (without passwords)
export const getAllUsers = (): UserWithoutPassword[] => {
  const stmt = db.prepare(`
    SELECT id, email, name, role, auth_type, last_login, created_at 
    FROM users ORDER BY created_at DESC
  `);
  const users = stmt.all() as any[];
  
  return users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    authType: u.auth_type,
    lastLogin: u.last_login,
    createdAt: u.created_at
  }));
};

// Create new user
export const createUser = (user: {
  email: string;
  password?: string | null;
  name: string;
  role?: string;
  authType?: string;
}): User => {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, name, role, auth_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  
  // Hash password if provided
  const hashedPassword = user.password ? bcrypt.hashSync(user.password, 10) : null;

  stmt.run(
    id,
    user.email,
    hashedPassword,
    user.name,
    user.role || 'user',
    user.authType || 'local'
  );

  return findUserById(id) as User;
};

// Update user's last login
export const updateLastLogin = (id: string): void => {
  const stmt = db.prepare(`
    UPDATE users SET last_login = datetime('now') WHERE id = ?
  `);
  stmt.run(id);
};

// Update user role
export const updateUserRole = (id: string, role: string): boolean => {
  const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
  const result = stmt.run(role, id);
  return result.changes > 0;
};

// Delete user
export const deleteUser = (id: string): boolean => {
  // Prevent deleting admin users
  const user = findUserById(id);
  if (user?.role === 'admin') {
    return false;
  }
  
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);
  return result.changes > 0;
};

// Find or create LDAP user (for auto-registration)
export const findOrCreateLdapUser = (ldapData: {
  email: string;
  name: string;
}): User => {
  let user = findUserByEmail(ldapData.email);
  
  if (!user) {
    // Auto-register LDAP user
    user = createUser({
      email: ldapData.email,
      password: null,
      name: ldapData.name,
      role: 'user',
      authType: 'ldap'
    });
    console.log(`✅ Auto-registered LDAP user: ${ldapData.email}`);
  }
  
  // Update last login
  updateLastLogin(user.id);
  
  return user;
};

// Get user stats
export const getUserStats = (): { total: number; admins: number; users: number; ldap: number; local: number } => {
  const total = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  const admins = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as any).count;
  const users = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any).count;
  const ldap = (db.prepare("SELECT COUNT(*) as count FROM users WHERE auth_type = 'ldap'").get() as any).count;
  const local = (db.prepare("SELECT COUNT(*) as count FROM users WHERE auth_type = 'local'").get() as any).count;
  
  return { total, admins, users, ldap, local };
};
