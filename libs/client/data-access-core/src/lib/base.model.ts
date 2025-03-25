import { IBase } from '@paris-2024/shared-interfaces';

export class BaseModel implements IBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
