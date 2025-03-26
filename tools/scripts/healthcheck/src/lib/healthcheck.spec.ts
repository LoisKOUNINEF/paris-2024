import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';
import { getEnvValue } from '@paris-2024/server-utils';
import { waitForDb } from '@paris-2024/db-readiness';

jest.mock('@paris-2024/server-utils', () => ({
  getEnvValue: jest.fn(),
}));

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return { Client: jest.fn(() => mClient) };
});

describe('dbCheck', () => {
  let clientMock: any;

  beforeEach(() => {
    clientMock = new Client();
    (getEnvValue as jest.Mock).mockImplementation((configService: ConfigService, key: string) => {
      const mockEnv: Record<string, string> = {
        DB_HOST: 'localhost',
        DB_USER: 'test-user',
        DB_PASSWORD: 'test-password',
        DB_NAME: 'test-db',
      };
      return mockEnv[key];
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database and return true on success', async () => {
    clientMock.connect.mockResolvedValueOnce(undefined);
    clientMock.query.mockResolvedValueOnce({ rows: [{ 1: 1 }] });
    clientMock.end.mockResolvedValueOnce(undefined);

    const result = await waitForDb(1, 1000);
    expect(clientMock.connect).toHaveBeenCalledTimes(1);
    expect(clientMock.query).toHaveBeenCalledWith('SELECT 1');
    expect(clientMock.end).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should retry the connection and return true if the database becomes ready', async () => {
    clientMock.connect
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValueOnce(undefined);
    clientMock.query.mockResolvedValueOnce({ rows: [{ 1: 1 }] });
    clientMock.end.mockResolvedValueOnce(undefined);

    const result = await waitForDb(2, 1000);
    expect(clientMock.connect).toHaveBeenCalledTimes(2);
    expect(clientMock.query).toHaveBeenCalledWith('SELECT 1');
    expect(clientMock.end).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('should return false after maxRetries if the database is not ready', async () => {
    clientMock.connect.mockRejectedValue(new Error('Connection failed'));

    const result = await waitForDb(2, 1000);
    expect(clientMock.connect).toHaveBeenCalledTimes(2);
    expect(result).toBe(false);
  });
});
