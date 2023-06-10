import { WalletStatus } from 'common/Enums/enums';
import { WalletsEntity } from '../entity/wallets.entity';

export class WalletPresenter {
  id: string;
  availableBalance: string;
  status: WalletStatus;
  pendingBalance?: string;

  constructor(wallet: WalletsEntity) {
    this.id = wallet.id;
    this.availableBalance = wallet.availableBalance;
    this.pendingBalance = wallet.pendingBalance;
    this.status = wallet.status;
  }
}
