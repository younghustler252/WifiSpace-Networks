export function startCrons() {
    import("../../modules/subscription/infrastructure/job/expire-subscription.cron.js");

    console.log("⏰ Crons loaded");
}