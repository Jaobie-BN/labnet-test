import bcrypt from "bcrypt";
import db from "../database/db";
import { User } from "../services/userService";

const SALT_ROUNDS = 10;

const hashLegacyPasswords = async () => {
  console.log("🔄 Starting password migration...");

  try {
    const users = db.prepare("SELECT * FROM users").all() as User[];
    let migratedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      if (!user.password) {
        continue;
      }

      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (
        user.password.startsWith("$2b$") ||
        user.password.startsWith("$2a$") ||
        user.password.startsWith("$2y$")
      ) {
        skippedCount++;
        continue;
      }

      console.log(`Processing user: ${user.email} (ID: ${user.id})`);

      const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

      db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
        hashedPassword,
        user.id
      );

      migratedCount++;
    }

    console.log("✅ Migration complete");
    console.log(`   - Migrated: ${migratedCount}`);
    console.log(`   - Skipped (Already hashed): ${skippedCount}`);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

hashLegacyPasswords();
