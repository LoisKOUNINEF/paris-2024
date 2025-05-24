import { ApiProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IBase } from '@paris-2024/shared-interfaces';

export class BaseEntity implements IBase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty()
  @CreateDateColumn({ 
    type: 'timestamptz',
    name: 'created_at' 
  })
  createdAt!: Date;

  @ApiProperty()
  @UpdateDateColumn({ 
    type: 'timestamptz',
    name: 'updated_at',
  })
  updatedAt!: Date;

  @ApiProperty()
  @DeleteDateColumn({ 
    type: 'timestamptz', 
    nullable: true,
    name: 'deleted_at' 
  })
  deletedAt!: Date | null;
}
