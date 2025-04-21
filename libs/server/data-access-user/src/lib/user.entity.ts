import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Generated,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, Matches } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Roles, IUser } from '@paris-2024/shared-interfaces';
import { BaseEntity } from '@paris-2024/server-base-entity';

export const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{10}$/;

@Entity()
export class User extends BaseEntity implements IUser {
  @Column({
    type: 'text',
    select: false 
  })
  @Generated('uuid')
  @Exclude({ toPlainOnly: true })
  @ApiProperty()
  secretKey: string;

  @Column({ type: 'text' })
  @ApiProperty()
  firstName: string;

  @Column({ type: 'text' })
  @ApiProperty()
  lastName: string;

  @Column({
    type: 'text',
    unique: true 
  })
  @IsEmail()
  @ApiProperty()
  email: string;

  @Column({ type: 'text' })
  /*
  ensures a minimum length of 10 characters 
  and at least 1 special character, 1 number, 1 lowercase & 1 uppercase.
  */
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
  })
  @ApiProperty({
    type: 'enum',
    enum: Roles,
    default: Roles.CUSTOMER,
  })
  role: Roles;

  @Column({ 
    type: 'text',
    default: 'cartId'
   })
  @ApiProperty()
  cartId: string;

  @Column({ 
    type: 'boolean',
    default: false
   })
  @ApiProperty()
  isAnonymized: boolean;

  @Column({ type: 'timestamptz' })
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
