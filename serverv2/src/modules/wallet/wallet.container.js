import { asClass } from "awilix";
import { WalletRepositoryMongo } from "./repositories/wallet.repository.mongo.js";

import { GetMyWallet } from "./usecases/user/get-my-wallet.usecase.js";
import { GetMyWalletTransactions } from "./usecases/user/get-my-wallet-transactions.usecase.js";
import { EnsureVirtualAccount } from "./usecases/user/ensure-virtual-account.usecase.js";
import { PayWithWallet } from "./usecases/user/pay-with-wallet.usecase.js";
import { FundWalletFromTransfer } from "./usecases/system/fund-wallet-from-transfer.usecase.js";
import { ReconcileWalletFunding } from "./usecases/system/reconcile-wallet-funding.usecase.js";
import { AdjustWallet } from "./usecases/admin/adjust-wallet.usecase.js";

import { WalletController } from "./controllers/wallet.controller.js";
import { WalletAdminController } from "./controllers/wallet-admin.controller.js";

export function registerWallet(container) {
	container.register({
		walletRepository: asClass(WalletRepositoryMongo).singleton(),

		getMyWallet: asClass(GetMyWallet).scoped(),
		getMyWalletTransactions: asClass(GetMyWalletTransactions).scoped(),
		ensureVirtualAccount: asClass(EnsureVirtualAccount).scoped(),
		payWithWallet: asClass(PayWithWallet).scoped(),
		fundWalletFromTransfer: asClass(FundWalletFromTransfer).scoped(),
		reconcileWalletFunding: asClass(ReconcileWalletFunding).scoped(),
		adjustWallet: asClass(AdjustWallet).scoped(),

		walletController: asClass(WalletController).scoped(),
		walletAdminController: asClass(WalletAdminController).scoped()
	});
}
