import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { config } from 'dotenv';
import { getEnvValue } from '@paris-2024/server-utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { EntitiesModule } from '@paris-2024/server-data-source-entities';

config();

export const createDataSource = (configService: ConfigService): DataSource => {
  const isProduction = configService.get('NODE_ENV') === 'production';

  const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: getEnvValue(configService, 'DB_HOST'),
    username: getEnvValue(configService, 'DB_USER'),
    database: getEnvValue(configService, 'DB_NAME'),
    password: getEnvValue(configService, 'DB_PASSWORD'),
    extra: {
      trustServerCertificate: true,
    },
    entities: EntitiesModule.provideEntities(),
    migrations: isProduction
      ? [path.join(__dirname, '..', '..', 'migrations', '*.js')]
      : [path.join(__dirname, '..', 'migrations', '*.ts')],
    migrationsRun: false,
    synchronize: false,
  };

  return new DataSource(dataSourceOptions);
};

const configService = new ConfigService();
const dataSource = createDataSource(configService);
export default dataSource;
