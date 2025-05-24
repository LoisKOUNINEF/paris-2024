import { BadRequestException } from '@nestjs/common';

export function noIdentifierProvided() {
  throw new BadRequestException({
    msg: 'Either userId or guestToken must be provided.',
  });
}
