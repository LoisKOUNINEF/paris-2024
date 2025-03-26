import { DataSource } from 'typeorm';
import { createDataSource } from '@paris-2024/server-data-source';
import { ConfigService } from '@nestjs/config';

export async function runMigrations() {
  const configService = new ConfigService();
  const dataSource: DataSource = createDataSource(configService);

  try {
    await dataSource.initialize();
    console.log('Data Source has been initialized!');

    const pendingMigrations = await dataSource.showMigrations();
    if (pendingMigrations) {
      console.log('Running migrations...');
      await dataSource.runMigrations();
      console.log('Migrations have been run successfully');
    } else {
      console.log('No pending migrations');
    }
  } catch (err) {
    console.error('Error during migration process', err);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('Data Source has been closed');
    }
  }
}
