export async function up(db) {
    console.log("Running migration: 006-migrate-notifications");

    const oldNotifications = await db.collection("notifications").find({}).toArray();
    let createdMaster = 0;
    let createdRecipients = 0;

    for (const oldNotif of oldNotifications) {
        // If the document has a state field, it has already been migrated
        if (oldNotif.state !== undefined) {
            continue;
        }

        const account = await db.collection("accounts").findOne({
            userId: oldNotif.user
        });

        const subscription = await db.collection("subscriptions").findOne({
            userId: oldNotif.user,
            status: "active"
        });

        // Standardize old lowercase strings to fit into modern schema conventions
        const typeMap = {
            payment_failed: "PAYMENT_FAILED",
            subscription_expiring_soon: "SUBSCRIPTION_EXPIRING_SOON",
            subscription_expiring_urgent: "SUBSCRIPTION_EXPIRING_URGENT",
            subscription_expired: "SUBSCRIPTION_EXPIRED",
            subscription_activated: "SUBSCRIPTION_ACTIVATED",
            subscription_renewed: "SUBSCRIPTION_RENEWED",
            admin_message: "ADMIN_MESSAGE",
            system_alert: "SYSTEM_ALERT",
            warning: "WARNING",
            admin_subscription_created: "ADMIN_SUBSCRIPTION_CREATED",
            announcement: "ANNOUNCEMENT"
        };
        const normalizedType = typeMap[oldNotif.type] || "SYSTEM_ALERT";

        // Map channels that were used in the old record
        const activeChannels = ["IN_APP"];
        if (oldNotif.channels?.email?.status === "sent") activeChannels.push("EMAIL");
        if (oldNotif.channels?.whatsapp?.status === "sent") activeChannels.push("WHATSAPP");

        const masterNotification = {
            accountId: account ? account._id : null,
            subscriptionId: subscription ? subscription._id : null,
            createdByAdminId: normalizedType.startsWith("ADMIN_") ? oldNotif.user : null,
            type: normalizedType,
            title: oldNotif.title || "Notification Update",
            message: oldNotif.message || "",
            state: "COMPLETED",
            channels: activeChannels,
            metadata: oldNotif.metadata || {},
            sentAt: oldNotif.createdAt || new Date(),
            completedAt: oldNotif.updatedAt || new Date(),
            cancelledAt: null,
            isArchived: oldNotif.isDeleted || false,
            createdAt: oldNotif.createdAt || new Date(),
            updatedAt: oldNotif.updatedAt || new Date()
        };

        // Step A: Insert the reusable master message context
        const insertResult = await db.collection("notifications").insertOne(masterNotification);
        const newNotificationId = insertResult.insertedId;
        createdMaster++;

        // Step B: Generate IN_APP delivery record mapping
        const inAppRecipient = {
            notificationId: newNotificationId,
            userId: oldNotif.user,
            channel: "IN_APP",
            priority: oldNotif.priority ? oldNotif.priority.toUpperCase() : "NORMAL",
            status: oldNotif.isRead ? "READ" : "DELIVERED",
            retryCount: 0,
            maxRetries: 3,
            nextRetryAt: null,
            queuedAt: oldNotif.createdAt || new Date(),
            sentAt: oldNotif.createdAt || new Date(),
            deliveredAt: oldNotif.channels?.inApp?.deliveredAt || oldNotif.createdAt || new Date(),
            readAt: oldNotif.isRead ? (oldNotif.updatedAt || new Date()) : null,
            failedAt: oldNotif.channels?.inApp?.status === "failed" ? oldNotif.updatedAt : null,
            cancelledAt: null,
            failedReason: oldNotif.channels?.inApp?.status === "failed" ? "In-app delivery dropped" : null,
            providerMessageId: null,
            providerResponse: {},
            metadata: { actionUrl: oldNotif.actionUrl || null },
            isArchived: oldNotif.isDeleted || false,
            createdAt: oldNotif.createdAt || new Date(),
            updatedAt: oldNotif.updatedAt || new Date()
        };
        await db.collection("notificationrecipients").insertOne(inAppRecipient);
        createdRecipients++;

        // Step C: Generate EMAIL delivery record mapping if requested previously
        if (oldNotif.channels?.email && oldNotif.channels.email.status !== "not_requested") {
            const emailStatusMap = { pending: "QUEUED", sent: "SENT", failed: "FAILED" };
            const emailRecipient = {
                notificationId: newNotificationId,
                userId: oldNotif.user,
                channel: "EMAIL",
                priority: "NORMAL",
                status: emailStatusMap[oldNotif.channels.email.status] || "SENT",
                retryCount: oldNotif.channels.email.status === "failed" ? 1 : 0,
                maxRetries: 3,
                nextRetryAt: null,
                queuedAt: oldNotif.createdAt || new Date(),
                sentAt: oldNotif.channels.email.sentAt || oldNotif.createdAt || null,
                deliveredAt: oldNotif.channels.email.sentAt || null,
                readAt: null,
                failedAt: oldNotif.channels.email.status === "failed" ? oldNotif.updatedAt : null,
                cancelledAt: null,
                failedReason: oldNotif.channels.email.error || null,
                providerMessageId: null,
                providerResponse: {},
                metadata: {},
                isArchived: oldNotif.isDeleted || false,
                createdAt: oldNotif.createdAt || new Date(),
                updatedAt: oldNotif.updatedAt || new Date()
            };
            await db.collection("notificationrecipients").insertOne(emailRecipient);
            createdRecipients++;
        }

        // Step D: Delete old record to clear collection space for the clean model data
        await db.collection("notifications").deleteOne({ _id: oldNotif._id });
    }

    console.log(`Master Notification nodes generated: ${createdMaster}`);
    console.log(`Delivery tracking recipient blocks mapped: ${createdRecipients}`);
}
