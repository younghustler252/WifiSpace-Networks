import mongoose from "mongoose";
import "../config/env.js";

const WSN_IDS = ["HS0035"]; // Add the new account's WSN ID here.

await mongoose.connect(process.env.MONGO_URI);

try {
  for (const wsnId of WSN_IDS) {
    const doc = await mongoose.connection.db
      .collection("accounts")
      .findOne(
        { wsnId },
        {
          projection: {
            wsnId: 1,
            serviceType: 1,
            routerPassword: 1,
            routerPasswordEncrypted: 1,
          },
        }
      );

    if (!doc) {
      console.log({ wsnId, found: false });
      continue;
    }

    const value = doc.routerPassword;

    console.log({
      wsnId: doc.wsnId,
      serviceType: doc.serviceType,
      routerPasswordFieldExists:
        Object.hasOwn(doc, "routerPassword"),
      routerPasswordType: typeof value,
      routerPasswordIsNull: value === null,
      routerPasswordLength:
        typeof value === "string" ? value.length : null,
      encryptedFieldExists:
        Object.hasOwn(doc, "routerPasswordEncrypted"),
      encryptedFieldType: typeof doc.routerPasswordEncrypted,
    });
  }
} finally {
  await mongoose.disconnect();
}