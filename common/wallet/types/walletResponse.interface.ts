import { WalletStatus } from 'common/Enums';

export interface WalletResponseInterface {
  id: string;
  availableBalance: string;
  status: WalletStatus;
  pendingBalance?: string;
}
