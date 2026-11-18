import test from "node:test";
import assert from "node:assert/strict";
import { WalletRepositoryMongo } from "../src/modules/wallet/repositories/wallet.repository.mongo.js";

const repo = new WalletRepositoryMongo();
repo.findByUserId = async () => ({ id: "w1" });
const stored = { id: "t1", userId: "u1", type: "credit", amountKobo: 1000, source: "transfer", balanceAfterKobo: 1000 };
const same = { userId: "u1", type: "credit", amountKobo: 1000, source: "transfer", reference: "paystack:R1" };

test("same reference with same details is a duplicate", async () => {
	const result = await repo._duplicateResult(stored, same);
	assert.equal(result.duplicate, true);
});

for (const patch of [{ userId: "u2" }, { type: "debit" }, { amountKobo: 2000 }, { source: "admin_adjustment" }]) {
	test(`same reference with different ${Object.keys(patch)[0]} is a conflict`, async () => {
		await assert.rejects(repo._duplicateResult(stored, { ...same, ...patch }), (e) => e.code === "WALLET_REFERENCE_CONFLICT" && e.statusCode === 409);
	});
}
