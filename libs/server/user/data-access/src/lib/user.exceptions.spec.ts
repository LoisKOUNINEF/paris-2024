import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { userNotFound, userAlreadyExists, incorrectCurrentPassword, passwordNotAppropriate, tokenNotFound } from './user.exceptions';

describe('Custom Exception Functions', () => {
  
  it('should throw NotFoundException when userNotFound is called', () => {
    try {
      userNotFound();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      if (error instanceof NotFoundException) {
        expect(error.getResponse()).toEqual({
          msg: 'No User with this email was found.',
        });
      };
    }
  });

  it('should throw ConflictException when userAlreadyExists is called', () => {
    expect.assertions(2);
    try {
      userAlreadyExists();
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      if (error instanceof ConflictException) {
        expect(error.getResponse()).toEqual({
          msg: 'User with this email already exists',
        });
      }
    }
  });

  it('should throw BadRequestException when incorrectCurrentPassword is called', () => {
    expect.assertions(2);
    try {
      incorrectCurrentPassword();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      if (error instanceof BadRequestException) {
        expect(error.getResponse()).toEqual({
          msg: 'Current password is incorrect',
        });
      }
    }
  });

  it('should throw BadRequestException when passwordNotAppropriate is called', () => {
    try {
      passwordNotAppropriate();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      if (error instanceof BadRequestException) {
        expect(error.getResponse()).toEqual({
          msg: 'Password must be at least 10 characters, and contain at least 1 number, 1 special character, 1 uppercase & 1 lowercase letter',
        });
      }
    }
  });

  it('should throw NotFoundException when tokenNotFound is called', () => {
    try {
      tokenNotFound();
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
      if (error instanceof NotFoundException) {
        expect(error.getResponse()).toEqual({
          msg: 'No password reset token found.',
        });
      }
    }
  });

});
