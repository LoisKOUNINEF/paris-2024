import { ForbiddenException, NotFoundException } from '@nestjs/common';

export function bundleAlreadyExists() {
  throw new ForbiddenException({
    msg: 'A bundle with this name already exists.',
  });
}

export function bundleNotFound() {
  throw new NotFoundException({
    msg: 'Bundle not found.',
  });
}
