import { UnauthorizedException } from "@nestjs/common";

export function emailNotVerified() {
  throw new UnauthorizedException('Please verify your email before logging in.');
}
