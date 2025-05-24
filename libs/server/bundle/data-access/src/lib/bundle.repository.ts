import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bundle } from './bundle.entity';
import { In, Repository } from 'typeorm';
import { CreateBundleDto, UpdateBundleDto } from './bundle.dto';
import {
  bundleAlreadyExists,
  bundleNotFound,
} from './bundle.exceptions';

@Injectable()
export class BundleRepository {
  constructor(
    @InjectRepository(Bundle) 
    private bundleRepository: Repository<Bundle>,
  ) {}

  async getBundles(): Promise<Array<Bundle> | null> {
    return await this.bundleRepository.find({ where: { deletedAt: undefined } });
  }

  async getManyByIds(ids: Bundle['id'][]): Promise<Array<Bundle>> {
    if (ids.length === 0) return [];
    
    return await this.bundleRepository.find({
      where: { id: In(ids) }
    });
  }

  async getOneByName(name: Bundle['name']): Promise<Bundle | null> {
    return await this.bundleRepository.findOne({
      where: {
        name: name,
        deletedAt: undefined,
      },
    });
  }

  async getOneById(id: Bundle['id']): Promise<Bundle | null> {
    return await this.bundleRepository.findOne({ 
      where: { id: id }
    });
  }

  async create(dto: CreateBundleDto): Promise<Bundle> {
    const bundleExists = await this.bundleRepository.findOneBy({
      name: dto.name,
    });

    if (bundleExists && bundleExists.deletedAt === null) {
      bundleAlreadyExists();
    }

    if (bundleExists && bundleExists.deletedAt) {
      this.restore(bundleExists, dto);
    }
    
    const newBundle = this.bundleRepository.create(dto);
    return await this.bundleRepository.save(newBundle);
  }

  async update(
    id: Bundle['id'],
    dto: UpdateBundleDto,
  ): Promise<Bundle | null> {
    const bundle = await this.getOneById(id);

    if (!bundle) {
      bundleNotFound();
      return null;
    }

    if (bundle.deletedAt !== null) {
      return await this.restore(bundle, dto);
    }

    await this.bundleRepository.save(Object.assign(bundle, dto));

    return bundle;
  }

  async remove(id: Bundle['id']) {
    const bundle = await this.getOneById(id);

    if (!bundle || bundle.deletedAt !== null) {
      bundleNotFound();
      return;
    }

    return await this.bundleRepository.softRemove(bundle);
  }

  private async restore(bundle: Bundle, dto: UpdateBundleDto): Promise<Bundle> {
    return await this.bundleRepository.save(
      Object.assign(bundle, {
        deletedAt: null,
        ...dto,
      }),
    );
  }
}
