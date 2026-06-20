export function startWorkers() {
    import("../../modules/subscription/infrastructure/workers/expire-subscription.runner.js");

    console.log("🚀 Workers loaded");
}