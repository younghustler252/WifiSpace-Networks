export class ConfirmHotspotPurchase {

    constructor({
        confirmPayment
    }) {

        this.confirmPayment =
            confirmPayment;
    }

    async execute(reference) {

        return await this
            .confirmPayment
            .execute({
                reference
            });
    }
}