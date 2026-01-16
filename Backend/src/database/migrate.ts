import db from './db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface JsonUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
}

interface JsonDevice {
  id: string;
  name: string;
  type: string;
  serialPort?: string;
  baudRate?: number;
  status?: string;
}

interface JsonLab {
  id: string;
  name: string;
  set?: number;
  status: string;
  devices: JsonDevice[];
}

const DATA_DIR = path.join(process.cwd(), 'data');

export const migrateData = () => {
  console.log('🔄 Starting data migration from JSON to SQLite...\n');

  // Migrate users
  const usersPath = path.join(DATA_DIR, 'users.json');
  if (fs.existsSync(usersPath)) {
    try {
      const users: JsonUser[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
      
      const insertUser = db.prepare(`
        INSERT OR REPLACE INTO users (id, email, password, name, role, auth_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      const insertMany = db.transaction((users: JsonUser[]) => {
        for (const user of users) {
          insertUser.run(
            user.id,
            user.email,
            user.password,
            user.name,
            user.role || 'user',
            'local'
          );
        }
      });

      insertMany(users);
      console.log(`✅ Migrated ${users.length} users`);
    } catch (error) {
      console.error('❌ Error migrating users:', error);
    }
  }

  // Migrate labs and devices
  const labsPath = path.join(DATA_DIR, 'labs.json');
  if (fs.existsSync(labsPath)) {
    try {
      const labs: JsonLab[] = JSON.parse(fs.readFileSync(labsPath, 'utf-8'));
      
      const insertLab = db.prepare(`
        INSERT OR REPLACE INTO labs (id, name, status)
        VALUES (?, ?, ?)
      `);

      const insertDevice = db.prepare(`
        INSERT OR REPLACE INTO devices (id, lab_id, name, type, serial_port, baud_rate, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const insertAll = db.transaction((labs: JsonLab[]) => {
        for (const lab of labs) {
          // Insert lab
          insertLab.run(lab.id, lab.name, lab.status || 'AVAILABLE');

          // Insert devices
          for (const device of lab.devices) {
            const deviceId = `${lab.id}-${device.id}`;
            insertDevice.run(
              deviceId,
              lab.id,
              device.name,
              device.type,
              device.serialPort || null,
              device.baudRate || 9600,
              device.status || 'AVAILABLE'
            );
          }
        }
      });

      insertAll(labs);
      const deviceCount = labs.reduce((acc, lab) => acc + lab.devices.length, 0);
      console.log(`✅ Migrated ${labs.length} labs with ${deviceCount} devices`);
    } catch (error) {
      console.error('❌ Error migrating labs:', error);
    }
  }

  console.log('\n🎉 Migration complete!');
};

// Run migration if called directly
if (require.main === module) {
  migrateData();
}

export default migrateData;
