import { BaseModel } from "@paris-2024/client-data-access-core";
import { ICartBundles, ICartModel } from "@paris-2024/shared-interfaces";

export class Cart extends BaseModel implements ICartModel {
	bundles: Array<ICartBundles>
	constructor(
		bundles: Array<ICartBundles>
	) {
		super();
		this.bundles = bundles;
	}
}
