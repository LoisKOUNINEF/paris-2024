import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';
import { getEnvValue } from './get-env-value';

jest.mock('fs');

describe('getEnvValue', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as ConfigService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the value from the file when the file path exists and file content is available', () => {
    const key = 'DB_PASSWORD';
    const filePath = '/path/to/secret/file';
    const fileContent = 'secret-password';

    (configService.get as jest.Mock).mockImplementation((k) => {
      if (k === `${key}_FILE`) return filePath;
      return '';
    });
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(fileContent);

    const result = getEnvValue(configService, key);

    expect(configService.get).toHaveBeenCalledWith(`${key}_FILE`);
    expect(fs.existsSync).toHaveBeenCalledWith(filePath);
    expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf8');
    expect(result).toBe(fileContent.trim());
  });

  it('should return the config service value when file path does not exist', () => {
    const key = 'DB_PASSWORD';
    const configValue = 'config-password';

    (configService.get as jest.Mock).mockImplementation((k) => {
      if (k === key) return configValue;
      return null;
    });
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const result = getEnvValue(configService, key);

    expect(configService.get).toHaveBeenCalledWith(`${key}_FILE`);
    expect(configService.get).toHaveBeenCalledWith(key);
    expect(result).toBe(configValue);
  });

  it('should return an empty string when neither file path nor config service value exists', () => {
    const key = 'DB_PASSWORD';

    (configService.get as jest.Mock).mockReturnValue(null);
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    const result = getEnvValue(configService, key);

    expect(configService.get).toHaveBeenCalledWith(`${key}_FILE`);
    expect(configService.get).toHaveBeenCalledWith(key);
    expect(result).toBe('');
  });
});
