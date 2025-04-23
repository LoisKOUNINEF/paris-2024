import { BaseModel } from "@paris-2024/client-data-access-core";
import { ICartModel, IItemJunctionModel } from "@paris-2024/shared-interfaces";

export class Cart extends BaseModel implements ICartModel {
	bundles: Array<IItemJunctionModel>
	constructor(
		bundles: Array<IItemJunctionModel>
	) {
		super();
		this.bundles = bundles;
	}
}
