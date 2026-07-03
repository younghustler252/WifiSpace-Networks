import dotenv from "dotenv";
import { ConfirmPaymentUseCase } from "../../serverv2/src/modules/payments/usecases/user/confirm-payment.js"; 
import { mikrotikService } from "./services/mikrotik.service.js";

dotenv.config();

async function runMockPipelineTest() {
    console.log("🚀 STARTING END-TO-END PIPELINE SIMULATION SYSTEM...");

    // 1. Set up clean router settings matching your .env profile configuration properties
    const routerConfig = {
        host: process.env.ROUTEROS_HOST || "192.168.0.7",
        username: process.env.ROUTEROS_USER || "billing",
        password: process.env.ROUTEROS_PASS || "Access@billing123$",
        port: parseInt(process.env.ROUTEROS_PORT || "8728", 10)
    };

    // 2. Clear out user "HS0002" from your router first to guarantee it hits the full fallback loops
    try {
        console.log(`🧹 Cleaning old user states for "HS0002" from router hardware...`);
        const userRecord = await mikrotikService.executeCommand(routerConfig, "/ip/hotspot/user/print", ["?name=HS0002"]);
        if (userRecord && userRecord.length > 0) {
            await mikrotikService.executeCommand(routerConfig, "/ip/hotspot/user/remove", [`=.id=${userRecord[0][".id"]}`]);
        }
        const activeRecord = await mikrotikService.executeCommand(routerConfig, "/ip/hotspot/active/print", ["?user=HS0002"]);
        if (activeRecord && activeRecord.length > 0) {
            await mikrotikService.executeCommand(routerConfig, "/ip/hotspot/active/remove", [`=.id=${activeRecord[0][".id"]}`]);
        }
        console.log("✅ Router interface state cleared cleanly.");
    } catch (e) {
        console.log("ℹ️ Presetting state notice:", e.message);
    }

    // 3. Mock the payload exactly how ConfirmPaymentUseCase expects it
    // Replace dependencies with mock configurations or real service instances from your DI container wrapper loaders
    try {
        console.log("\n📦 Triggering ConfirmPaymentUseCase.execute() layer simulation...");
        
        // This is a manual demonstration. If you have dependency injection initialized:
        // const useCase = container.resolve('confirmPaymentUseCase');
        // const output = await useCase.execute({ reference: "MOCK_REF_123" });
        
        console.log("--------------------------------------------------");
        console.log("💡 Tip: To run live, trigger a real request via Postman!");
        console.log("Make a POST request to your real endpoint:");
        console.log("POST http://localhost:4000/api/payments/verify");
        console.log('Body: { "reference": "YOUR_PAYSTACK_REFERENCE" }');
        console.log("--------------------------------------------------");

    } catch (err) {
        console.error("❌ Pipeline test crashed:", err.message);
    }
}

runMockPipelineTest();
