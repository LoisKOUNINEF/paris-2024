import { SetMetadata } from '@nestjs/common';

export const Owner = (owner: boolean) => SetMetadata('owner', owner);
