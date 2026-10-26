import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Generated,
  Unique,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsEmail, Matches } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Roles, IUser } from '@paris-2024/shared-interfaces';
import { BaseEntity } from '@paris-2024/server-base-entity';
import { passwordRegex, uuidRegex } from '@paris-2024/shared-utils';
import { hash } from '@paris-2024/server-utils';

@Entity()
@Unique('UQ_user_email', ['email'])
export class User extends BaseEntity implements IUser {
  @Column({
    type: 'text',
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

  // indexed by the UQ_user_email constraint
  @Column({
    type: 'text',
    name: 'email'
  })
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
    type: 'string', 
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

  @Column({
    type: 'boolean',
    default: false,
    name: 'email_verified'
  })
  @ApiProperty()
  emailVerified: boolean;

  @Column({
    type: 'text',
    nullable: true,
    name: 'email_verification_token'
  })
  @Exclude({ toPlainOnly: true })
  @ApiProperty()
  emailVerificationToken: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'pending_email'
  })
  @ApiProperty()
  pendingEmail: string | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'anonymization_reminder_sent_at'
  })
  anonymizationReminderSentAt: Date | null;

  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'inactivity_reminder_sent_at'
  })
  inactivityReminderSentAt: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (
      this.password &&
      !/^\$2[aby]\$[0-9]{2}\$.+/.test(this.password)
    ) {
      this.password = await bcrypt.hash(this.password, Number(10));
    }
  }

  @BeforeInsert()
  async hashSecretKey() {
    if (uuidRegex.test(this.secretKey)) {
      this.secretKey = hash(this.secretKey);
      return;
    }
  }
}
