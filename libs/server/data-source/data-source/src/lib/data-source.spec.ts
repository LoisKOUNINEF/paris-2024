import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { createDataSource } from './data-source'; 
import { getEnvValue } from '@paris-2024/server-utils';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { EntitiesModule } from '@paris-2024/server-data-source-entities';

jest.mock('@nestjs/config');
jest.mock('@paris-2024/server-utils');
// jest.mock('typeorm');
jest.mock('@paris-2024/server-data-source-entities', () => ({
  EntitiesModule: {
    provideEntities: jest.fn().mockReturnValue([]),
  },
}));


describe('createDataSource', () => {
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    } as any;

    (getEnvValue as jest.Mock).mockImplementation((_, key) => `mock_${key}`);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a DataSource with correct options for production environment', () => {
    mockConfigService.get.mockReturnValue('production');

    const result = createDataSource(mockConfigService);

    expect(result.options).toMatchObject({
      type: 'postgres',
      host: 'mock_DB_HOST',
      username: 'mock_DB_USER',
      database: 'mock_DB_NAME',
      password: 'mock_DB_PASSWORD',
      extra: {
        trustServerCertificate: true,
      },
      entities: expect.arrayContaining(EntitiesModule.provideEntities()),
      migrations: expect.arrayContaining([expect.stringContaining('migrations/*.js')]),
      migrationsRun: false,
      synchronize: false,
    });

    expect(result).toBeInstanceOf(DataSource);
  });

  it('should create a DataSource with correct options for non-production environment', () => {
    mockConfigService.get.mockReturnValue('development');

    const result = createDataSource(mockConfigService);

    expect(result.options).toMatchObject({
      type: 'postgres',
      host: 'mock_DB_HOST',
      username: 'mock_DB_USER',
      database: 'mock_DB_NAME',
      password: 'mock_DB_PASSWORD',
      extra: {
        trustServerCertificate: true,
      },
      entities: [expect.arrayContaining(EntitiesModule.provideEntities())],
      migrations: [expect.stringContaining('libs/server/data-source/data-source/src/migrations/*.ts')],
      migrationsRun: false,
      synchronize: false,
    });

    expect(result).toBeInstanceOf(DataSource);
  });
});