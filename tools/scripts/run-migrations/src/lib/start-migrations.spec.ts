import { waitForDb } from '@paris-2024/db-readiness';
import { startMigrations } from './start-migrations';
import * as runMigrations from './run-migrations';

jest.mock('@paris-2024/db-readiness');

describe('startMigrations', () => {
  const exitMock = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should run migrations if the database is ready', async () => {
    (waitForDb as jest.Mock).mockResolvedValue(true);
    const runMigrationsSpy = jest.spyOn(runMigrations, 'runMigrations');

    await startMigrations();

    expect(waitForDb).toHaveBeenCalledTimes(1);
    expect(runMigrationsSpy).toHaveBeenCalled();

    runMigrationsSpy.mockRestore();
  });

  it('should exit with code 1 if the database is not ready', async () => {
    (waitForDb as jest.Mock).mockResolvedValue(false);

    await startMigrations();

    expect(waitForDb).toHaveBeenCalledTimes(1);
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it('should handle errors when waiting for the database and exit with code 1', async () => {
    const error = new Error('DB readiness error');
    (waitForDb as jest.Mock).mockRejectedValue(error);

    await startMigrations();

    expect(waitForDb).toHaveBeenCalledTimes(1);
    expect(exitMock).toHaveBeenCalledWith(1);
  });
});
