import { SetMetadata } from '@nestjs/common';

export const Staff = (staff: boolean) => SetMetadata('staff', staff);
