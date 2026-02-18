const Brevo = require("@getbrevo/brevo");

const client = new Brevo.TransactionalEmailsApi();

client.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

async function sendWhatsapp(user, payment) {
  return await client.sendWhatsappMessage({
    sender: process.env.BREVO_WHATSAPP_SENDER,
    to: user.phoneNumber,
    templateId: "your-template-id",
    params: {
      name: user.fullName,
      amount: payment.amount,
    },
  });
}

module.exports = {
  sendWhatsapp,
};
