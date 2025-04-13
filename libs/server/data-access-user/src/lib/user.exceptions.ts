import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export function userNotFound() {
  throw new NotFoundException({
    msg: 'No User with this email was found.',
  });
}

export function userAlreadyExists() {
  throw new ForbiddenException({
    msg: 'User with this email already exists',
  });
}

export function createAdminIsForbidden() {
  throw new ForbiddenException({
    msg: 'Cannot create an Admin user. Contact your system administrator.',
  });
}

export function passwordNotAppropriate() {
  throw new BadRequestException({
    msg: 'Password must be at least 10 characters, and contain at least 1 number, 1 special character, 1 uppercase & 1 lowercase letter',
  });
}

export function tokenNotFound() {
  throw new NotFoundException({
    msg: 'No password reset token found.',
  });
}
