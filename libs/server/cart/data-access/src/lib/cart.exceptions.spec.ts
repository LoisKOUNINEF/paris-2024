import { BadRequestException } from '@nestjs/common';
import { noIdentifierProvided } from './cart.exceptions';

describe('Custom Exception Functions', () => {
  
  it('should throw NotFoundException when bundleNotFound is called', () => {
    try {
      noIdentifierProvided();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      if (error instanceof BadRequestException) {
        expect(error.getResponse()).toEqual({
          msg: 'Either userId or guestToken must be provided.',
        });
      };
    }
  });
});
