import fs from 'fs';
import path from 'path';

// Define User Interface (internal to backend)
export interface User {
  id: string;
  email: string;
  password: string; // Plain text for now
  name: string;
  role: string;
}

// Path to users.json (Resolved relative to project root)
// Assuming we run from 'c:\Test\Backend'
const DATA_PATH = path.join(process.cwd(), 'data', 'users.json');

export const findUserByEmail = (email: string): User | undefined => {
  try {
    const fileData = fs.readFileSync(DATA_PATH, 'utf-8');
    const users: User[] = JSON.parse(fileData);
    return users.find(u => u.email === email);
  } catch (error) {
    console.error('Error reading user database:', error);
    return undefined;
  }
};

export const getAllUsers = (): User[] => {
  try {
    const fileData = fs.readFileSync(DATA_PATH, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

export const deleteUser = (id: string): boolean => {
  try {
    const users = getAllUsers();
    // Prevent deleting the main admin if wanted, but for now just simple delete
    const updatedUsers = users.filter((u) => u.id !== id);
    
    if (users.length === updatedUsers.length) {
        return false; // User not found
    }

    fs.writeFileSync(DATA_PATH, JSON.stringify(updatedUsers, null, 2));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

