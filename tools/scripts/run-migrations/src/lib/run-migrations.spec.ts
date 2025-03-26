import { DataSource } from 'typeorm';
import { createDataSource } from '@paris-2024/server-data-source';
import { runMigrations } from './run-migrations';

jest.mock('@paris-2024/server-data-source');
jest.mock('@nestjs/config');

describe('runMigrations', () => {
  let dataSourceMock: jest.Mocked<DataSource>;

  const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  beforeEach(() => {
    dataSourceMock = {
      initialize: jest.fn(),
      showMigrations: jest.fn(),
      runMigrations: jest.fn(),
      destroy: jest.fn(),
      isInitialized: true,
    } as unknown as jest.Mocked<DataSource>;

    (createDataSource as jest.Mock).mockReturnValue(dataSourceMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the data source and run migrations if pending', async () => {
    dataSourceMock.showMigrations.mockResolvedValue(true);

    await runMigrations();

    expect(dataSourceMock.initialize).toHaveBeenCalledTimes(1);
    expect(dataSourceMock.runMigrations).toHaveBeenCalledTimes(1);
    expect(dataSourceMock.destroy).toHaveBeenCalledTimes(1);
  });

  it('should not run migrations if none are pending', async () => {
    dataSourceMock.showMigrations.mockResolvedValue(false);

    await runMigrations();

    expect(dataSourceMock.initialize).toHaveBeenCalledTimes(1);
    expect(dataSourceMock.runMigrations).not.toHaveBeenCalled();
    expect(dataSourceMock.destroy).toHaveBeenCalledTimes(1);
  });

  it('should handle errors during migration process and exit with code 1', async () => {
    const error = new Error('Initialization error');
    dataSourceMock.initialize.mockRejectedValue(error);

    await runMigrations();

    expect(dataSourceMock.initialize).toHaveBeenCalledTimes(1);
    expect(exitMock).toHaveBeenCalledWith(1);
    expect(dataSourceMock.destroy).toHaveBeenCalledTimes(1);
  });

  it('should destroy the data source even if no error occurs', async () => {
    dataSourceMock.showMigrations.mockResolvedValue(true);

    await runMigrations();

    expect(dataSourceMock.initialize).toHaveBeenCalledTimes(1);
    expect(dataSourceMock.destroy).toHaveBeenCalledTimes(1);
  });
});
