// infrastructure/jobs/queues/provisioning.queue.js
import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const provisioningQueue = new Queue("provisioning", { connection });