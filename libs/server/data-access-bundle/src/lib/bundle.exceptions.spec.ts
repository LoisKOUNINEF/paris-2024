import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { bundleAlreadyExists, bundleNotFound } from './bundle.exceptions';

describe('Custom Exception Functions', () => {
  
  it('should throw NotFoundException when bundleNotFound is called', () => {
    try {
      bundleNotFound();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      if (error instanceof NotFoundException) {
        expect(error.getResponse()).toEqual({
          msg: 'Bundle not found.',
        });
      };
    }
  });

  it('should throw ForbiddenException when bundleAlreadyExists is called', () => {
    try {
      bundleAlreadyExists();
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      if (error instanceof ForbiddenException) {
        expect(error.getResponse()).toEqual({
          msg: 'A bundle with this name already exists.',
        });
      }
    }
  });
});
