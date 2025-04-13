import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordReset } from './password-reset.entity';

@Injectable()
export class PasswordResetRepository {
  constructor(
    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>,
  ) {}

  async create(email: string): Promise<PasswordReset> {
    const newPwdReset = this.passwordResetRepository.create({ email });

    return await this.passwordResetRepository.save(newPwdReset);
  }

  async findOne(id: string): Promise<PasswordReset | null> {
    return await this.passwordResetRepository.findOne({
      where: { id: id },
    });
  }

  async findOneByEmail(email: string): Promise<PasswordReset | null> {
    return await this.passwordResetRepository.findOneBy({ email: email });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async remove(id: string): Promise<any> {
    const pwdReset = await this.findOne(id);
    if (!pwdReset) {
      return;
    }
    return await this.passwordResetRepository.remove(pwdReset);
  }
}