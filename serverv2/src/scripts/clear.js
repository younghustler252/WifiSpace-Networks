import mongoose from "mongoose";
import "../config/env.js";

await mongoose.connect(process.env.MONGO_URI);

try {
  const db = mongoose.connection.db;

  const account = await db.collection("accounts").findOne(
    { _id: new mongoose.Types.ObjectId("6acbba17be3eaae283e855d2") },
    {
      projection: {
        username: 1,
        serviceType: 1,
        routerId: 1,
        password: 1,
        passwordEncrypted: 1,
        credentials: 1,
      },
    }
  );

  if (!account) {
    console.log("Account not found");
  } else {
    console.log({
      username: account.username,
      serviceType: account.serviceType,
      routerId: account.routerId?.toString?.() ?? account.routerId,
      fields: Object.keys(account),
      passwordExists: Object.hasOwn(account, "password"),
      passwordEncryptedExists: Object.hasOwn(
        account,
        "passwordEncrypted"
      ),
      credentialsExists: Object.hasOwn(account, "credentials"),
    });
  }
} finally {
  await mongoose.disconnect();
}