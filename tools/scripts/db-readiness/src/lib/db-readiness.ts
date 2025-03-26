import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';
import { getEnvValue } from '@paris-2024/server-utils';

const configService = new ConfigService();

const dbCheck = async (): Promise<boolean> => {
  const client = new Client({
    host: getEnvValue(configService, 'DB_HOST'),
    user: getEnvValue(configService, 'DB_USER'),
    password: getEnvValue(configService, 'DB_PASSWORD'),
    database: getEnvValue(configService, 'DB_NAME'),
  });

  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    console.log('Database is ready');
    return true;
  } catch (err) {
    console.error('Database is not ready:', err);
    return false;
  }
};

export const waitForDb = async (maxRetries = 30, retryInterval = 5000): Promise<boolean> => {
  for (let i = 0; i < maxRetries; i++) {
    if (await dbCheck()) {
      return true;
    }
    console.log(`Retrying in ${retryInterval / 1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, retryInterval));
  }
  return false;
};