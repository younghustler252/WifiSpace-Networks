export class ReconcileWalletFunding {
	constructor({ paystackProvider, fundWalletFromTransfer, walletRepository }) {
		this.paystackProvider = paystackProvider;
		this.fundWalletFromTransfer = fundWalletFromTransfer;
		this.walletRepository = walletRepository;
	}

	async execute({ from, to = new Date(), apply = false, requery = false }) {
		const requeried = requery ? await this._requeryAll(to) : [];
		const transfers = await this.paystackProvider.listDedicatedTransfers({ from, to });

		const summary = { mode: apply ? "applied" : "dry-run", from, to, found: transfers.length, alreadyCredited: 0, wouldCredit: 0, credited: 0, unmatched: 0, requeried: requeried.length };
		const rows = [];

		for (const transfer of transfers) {
			const existing = await this.walletRepository.findTransactionByReference(`paystack:${transfer.reference}`);
			const base = { reference: transfer.reference, amount: transfer.amountKobo / 100, accountNumber: transfer.accountNumber, email: transfer.email, sender: transfer.senderName, paidAt: transfer.paidAt };

			if (existing) {
				summary.alreadyCredited++;
				rows.push({ ...base, status: "already_credited" });
				continue;
			}

			if (!apply) {
				const wallet = await this._findWallet(transfer);
				if (wallet) summary.wouldCredit++;
				else summary.unmatched++;
				rows.push({ ...base, status: wallet ? "would_credit" : "unmatched" });
				continue;
			}

			const result = await this.fundWalletFromTransfer.execute({
				reference: transfer.reference, amountKobo: transfer.amountKobo,
				accountNumber: transfer.accountNumber, customerCode: transfer.customerCode,
				email: transfer.email, senderName: transfer.senderName
			});

			if (result.handled && !result.duplicate) {
				summary.credited++;
				rows.push({ ...base, status: "credited" });
			} else if (result.handled) {
				summary.alreadyCredited++;
				rows.push({ ...base, status: "already_credited" });
			} else {
				summary.unmatched++;
				rows.push({ ...base, status: "unmatched" });
			}
		}

		return { summary, rows, requeried };
	}

	async _findWallet({ accountNumber, customerCode }) {
		return (accountNumber && (await this.walletRepository.findByAccountNumber(accountNumber)))
			|| (customerCode && (await this.walletRepository.findByCustomerCode(customerCode)))
			|| null;
	}

	async _requeryAll(to) {
		const accounts = await this.walletRepository.listVirtualAccountNumbers();
		const date = to.toISOString().slice(0, 10);
		const results = [];

		for (const accountNumber of accounts) {
			try {
				await this.paystackProvider.requeryDedicatedAccount({ accountNumber, providerSlug: process.env.PAYSTACK_DVA_BANK || "wema-bank", date });
				results.push({ accountNumber, ok: true });
			} catch (error) {
				results.push({ accountNumber, ok: false, error: error.message });
			}
		}

		return results;
	}
}
