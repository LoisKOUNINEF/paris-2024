import { createHash, randomBytes } from "crypto";

export function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function createToken(): string {
  return randomBytes(32).toString('hex');
}
