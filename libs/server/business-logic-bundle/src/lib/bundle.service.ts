import { Injectable } from "@nestjs/common";
import { Bundle, bundleNotFound, BundleRepository, CreateBundleDto, UpdateBundleDto } from "@paris-2024/server-data-access-bundle";
import { ItemJunctionRepository } from "@paris-2024/server-data-access-item-junction";
import { IBundleSales } from "@paris-2024/shared-interfaces";

@Injectable()
export class BundleService {
	constructor( 
		private bundleRepository: BundleRepository,
		private itemJunctionRepository: ItemJunctionRepository,	
	) {}

	async getOneWithSales(bundleId: Bundle['id']): Promise<IBundleSales | undefined> {
		const bundle = await this.bundleRepository.getOneById(bundleId);

		if (!bundle) {
			bundleNotFound();
			return;
		}

		const sales = await this.itemJunctionRepository.getOneWithSales(bundleId);

		return { bundle, sales }
	}

	async getAllWithSales(): Promise<Array<IBundleSales> | undefined> {
		const bundles = await this.bundleRepository.getBundles();

		if (!bundles) {
			bundleNotFound();
			return;
		}

		const bundleIds = bundles.map((bundle: Bundle) => bundle.id);
		const sales = await this.itemJunctionRepository.getAllWithSales(bundleIds);

	  const bundleSales = bundles.map((bundle: Bundle) => ({
	    bundle: bundle,
	    sales: sales[bundle.id]
	  }));

		return bundleSales;
	}

	async getBundles(name?: string): Promise<Array<Bundle> | Bundle | null> {
		if(name) {
			return await this.bundleRepository.getOneByName(name);
		}
		return await this.bundleRepository.getBundles();
	}

	async createBundle(dto: CreateBundleDto): Promise<Bundle> {
		return await this.bundleRepository.create(dto);
	}

	async updateBundle(bundleId: string, dto: UpdateBundleDto): Promise<Bundle | null> {
		return await this.bundleRepository.update(bundleId, dto);
	}

	async getOneByName(name: string): Promise<Bundle | null> {
		return await this.bundleRepository.getOneByName(name);
	}

	async getOneById(id: string): Promise<Bundle | null> {
		return await this.bundleRepository.getOneById(id);
	}

	async remove(bundleId: string): Promise<Bundle | undefined> {
		return await this.bundleRepository.remove(bundleId);
	}
}