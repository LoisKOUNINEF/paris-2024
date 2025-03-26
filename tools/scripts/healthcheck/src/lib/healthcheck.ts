import * as http from 'http';
import { waitForDb } from '@paris-2024/db-readiness';

const apiCheck = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 3000;
    http.get(`http://localhost:${port}/api`, (res: any) => {
      if (res.statusCode === 200) {
        resolve();
      } else {
        reject(new Error(`API check failed with status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
};

async function runHealthCheck(): Promise<void> {
  try {
    const dbReady = await waitForDb();
    if (!dbReady) {
      throw new Error('Database not ready after maximum retries');
    }
    await apiCheck();
    console.log('Health check passed');
    process.exit(0);
  } catch (err) {
    console.error('Health check failed:', err);
    process.exit(1);
  }
}

runHealthCheck();
