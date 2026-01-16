import { Request, Response } from 'express';
import { getSystemStats, forceReleaseLab } from '../services/labService';
import { getAllUsers, deleteUser } from '../services/userService';

// GET /api/admin/dashboard-stats
export const getDashboardStats = (req: Request, res: Response) => {
  try {
    const systemStats = getSystemStats();
    res.json(systemStats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// GET /api/admin/users
export const getUsers = (req: Request, res: Response) => {
  try {
    const users = getAllUsers();
    // Filter out passwords
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// DELETE /api/admin/users/:id
export const removeUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = deleteUser(id);
    
    if (success) {
      res.json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// POST /api/admin/labs/:id/force-release
export const forceRelease = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = forceReleaseLab(id);
    
    if (success) {
      res.json({ message: 'Lab forced release successfully' });
    } else {
      res.status(404).json({ message: 'Lab not found or error releasing' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error releasing lab' });
  }
};
