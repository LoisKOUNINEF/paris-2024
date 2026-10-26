import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@paris-2024/server-data-access-user';
import { IUser } from '@paris-2024/shared-interfaces';
import { emailNotVerified } from './auth.exceptions';

@Injectable()
export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async validateUser(email: string, password: string): Promise<Partial<IUser> | null> {
    const user = await this.userRepository.findOneByEmail(email);

    // soft-deleted accounts are looked up too (emails stay unique), but cannot log in
    if (!user || user.deletedAt !== null) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return null;
    }

    if (!user.emailVerified) {
      emailNotVerified()
      return null;
    }

    await this.userRepository.updateLastLogin(user.id);

    // req.user is a plain object, entity @Exclude rules do not apply: only expose what is needed
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isAnonymized: user.isAnonymized,
    } as Partial<IUser>;
  }
}
