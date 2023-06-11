import { WalletsEntity } from '../entity/wallets.entity';

export class WalletPresenter {
  id: string;
  availableBalance: number;
  pendingDeposit?: number;
  pendingWithdraw?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(wallet: WalletsEntity) {
    this.id = wallet.id;
    this.availableBalance = wallet.availableBalance;
    this.pendingDeposit = wallet.pendingDeposit ?? undefined;
    this.pendingWithdraw = wallet.pendingWithdraw ?? undefined;

    this.createdAt = wallet.createdAt;
    this.updatedAt = wallet.updatedAt;
  }
}
