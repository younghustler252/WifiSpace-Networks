import "../config/env.js";
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGO_URI);

const collection = mongoose.connection.collection("counters");

console.log("Indexes before:");
console.dir(await collection.indexes(), { depth: null });

await collection.dropIndex("name_1");

console.log("\nRemoved name_1 index.");

console.log("\nIndexes after:");
console.dir(await collection.indexes(), { depth: null });

await mongoose.disconnect();
