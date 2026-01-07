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
