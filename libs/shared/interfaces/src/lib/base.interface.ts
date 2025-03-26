export interface IBase {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export type XOR<T, U> = ( T | U ) extends object
  ? ( T extends U ? never : T ) | ( U extends T ? never : U)
  : T | U;
