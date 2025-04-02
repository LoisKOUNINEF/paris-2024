import { BadRequestException } from "@nestjs/common";

export function userDoesntExist() {
  try {
    throw new BadRequestException({
      msg: 'No User with this email was found',
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function incorrectPassword() {
  try {
    throw new BadRequestException({
      msg: 'Password is incorrect',
    });
  } catch (error) {
    console.error(error);
    return null;
  }
}
