import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Generated,
  Index,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, Matches } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Roles, IUser } from '@paris-2024/shared-interfaces';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { passwordRegex } from '@paris-2024/shared-utils';

@Entity()
@Unique('UQ_user_email', ['email'])
export class User extends BaseEntity implements IUser {
  @Column({
    type: 'uuid',
    select: false,
    name: 'secret_key'
  })
  @Generated('uuid')
  @Exclude({ toPlainOnly: true })
  @ApiProperty()
  secretKey: string;
  
  @Column({ 
    type: 'text',
    name: 'first_name' 
  })
  @ApiProperty()
  firstName: string;

  @Column({ 
    type: 'text',
    name: 'last_name'
  })
  @ApiProperty()
  lastName: string;

  @Column({
    type: 'text',
    unique: true,
    name: 'email'
  })
  @Index('IDX_user_email')
  @IsEmail()
  @ApiProperty()
  email: string;

  @Column({ 
    type: 'text',
    name: 'password'
  })
  @Matches(passwordRegex)
  @Exclude({ toPlainOnly: true })
  @ApiProperty({ 
    type: 'text', 
    example: '10Characters+',
  })
  password: string;

  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.CUSTOMER,
    name: 'role'
  })
  @ApiProperty({
    type: 'enum',
    enum: Roles,
    default: Roles.CUSTOMER,
  })
  role: Roles;

  @Column({ 
    type: 'boolean',
    default: false,
    name: 'is_anonymized'
   })
  @ApiProperty()
  isAnonymized: boolean;

  @Column({ 
    type: 'timestamptz',
    name: 'last_login_at' 
  })
  @ApiProperty()
  lastLoginAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, Number(10));
    }
  }
}
