import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BundleRepository } from './bundle.repository';
import { Bundle } from './bundle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bundle])],
  providers: [BundleRepository],
  exports: [BundleRepository, TypeOrmModule],
})
export class DataAccessBundleModule {}
