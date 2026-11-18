import test from "node:test";
import assert from "node:assert/strict";
import { FundWalletFromTransfer } from "../src/modules/wallet/usecases/system/fund-wallet-from-transfer.usecase.js";

const build = () => {
	const applied = [];
	const walletRepository = {
		findByAccountNumber: async () => ({ id: "w1", userId: "u1" }),
		findByCustomerCode: async () => null,
		findByUserId: async () => ({ id: "w1", userId: "u1" }),
		apply: async (entry) => {
			if (applied.some((e) => e.reference === entry.reference)) return { duplicate: true, wallet: { id: "w1" } };
			applied.push(entry);
			return { duplicate: false, wallet: { id: "w1" } };
		}
	};
	return { applied, usecase: new FundWalletFromTransfer({ walletRepository, userRepository: {}, auditService: null, autoRenewSubscriptions: null }) };
};

const good = { reference: "R1", amountKobo: 500000, status: "successful", currency: "NGN", accountNumber: "123" };

test("successful NGN transfer credits once, repeat deliveries do not", async () => {
	const { applied, usecase } = build();
	await usecase.execute(good);
	const again = await usecase.execute(good);
	const concurrent = await Promise.all([usecase.execute(good), usecase.execute(good)]);
	assert.equal(applied.length, 1);
	assert.equal(applied[0].reference, "paystack:R1");
	assert.equal(again.duplicate, true);
	assert.ok(concurrent.every((r) => r.duplicate));
});

test("webhook and reconciliation share the same reference", async () => {
	const { applied, usecase } = build();
	await usecase.execute(good);
	await usecase.execute({ ...good, email: "a@b.c" });
	assert.equal(applied.length, 1);
});

for (const [name, patch, reason] of [
	["failed transfer", { status: "failed" }, "transfer_not_successful"],
	["non-NGN currency", { currency: "USD" }, "invalid_currency"],
	["missing currency", { currency: null }, "invalid_currency"],
	["zero amount", { amountKobo: 0 }, "invalid_amount"],
	["fractional amount", { amountKobo: 10.5 }, "invalid_amount"],
	["missing reference", { reference: "" }, "invalid_reference"]
]) {
	test(`rejects ${name}`, async () => {
		const { applied, usecase } = build();
		const result = await usecase.execute({ ...good, ...patch });
		assert.equal(result.handled, false);
		assert.equal(result.reason, reason);
		assert.equal(applied.length, 0);
	});
}
