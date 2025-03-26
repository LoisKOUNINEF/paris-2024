import { runMigrations } from './run-migrations';
import { waitForDb } from '@paris-2024/db-readiness';

export async function startMigrations() {
  try {
    const ready: boolean = await waitForDb();
    if (ready) {
      console.log('Database is ready, proceeding with migrations');
      await runMigrations();
    } else {
      console.error('Database not ready after maximum retries');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error waiting for the database', err);
    process.exit(1);
  }
}

startMigrations();
