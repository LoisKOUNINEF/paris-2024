import { ConfigService } from "@nestjs/config";
import * as fs from 'fs';

export function getEnvValue(configService: ConfigService, key: string): string {
  const fileEnvKey = `${key}_FILE`;
  const filePath = configService.get<string>(fileEnvKey);
  if (filePath && fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8').trim();
  }
  return configService.get<string>(key) || '';
}
