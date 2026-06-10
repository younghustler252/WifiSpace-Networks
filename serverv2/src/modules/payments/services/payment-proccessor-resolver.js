export class PaymentProcessorResolver {

    constructor({
        paymentProcessorService,
        hotspotPaymentProcessorService
    }) {
        this.paymentProcessorService =
            paymentProcessorService;

        this.hotspotPaymentProcessorService =
            hotspotPaymentProcessorService;
    }

    resolve(serviceType) {

        switch (serviceType) {

            case "hotspot":
                return this.hotspotPaymentProcessorService;

            default:
                return this.paymentProcessorService;
        }
    }
}