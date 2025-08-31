import fs from 'fs';
import path from 'path';
import { db } from '../config/database';
import { logger } from '../utils/logger';

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');

    const sqlFile = path.join(__dirname, 'createTables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL file by statements and execute each one
    const statements = sql.split(';').filter(statement => statement.trim().length > 0);

    for (const statement of statements) {
      try {
        await db.query(statement);
        logger.debug('Executed SQL statement successfully');
      } catch (error) {
        logger.error('Error executing SQL statement:', { statement, error });
        throw error;
      }
    }

    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('Migrations finished');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration error:', error);
      process.exit(1);
    });
}

export { runMigrations };