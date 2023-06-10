import { WalletsEntity } from "../entity";

export type WalletType = Omit<WalletsEntity, 'createdAt' | 'updatedAt'>;
