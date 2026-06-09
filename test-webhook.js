const crypto = require("crypto");

const secretStr = "whsec_UVXKxXZnU00Xj4qUNJjSpSXAgKNd+ndV";
// secret is base64 encoded after the "whsec_" prefix
const secretBytes = Buffer.from(secretStr.split("_")[1], "base64");

const payload = {
  data: {
    id: "user_2test1234567890",
    email_addresses: [{ email_address: "test@example.com" }],
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    image_url: "https://example.com/avatar.jpg"
  },
  object: "event",
  type: "user.created"
};

const msgId = "msg_1234567890";
const timestamp = Math.floor(Date.now() / 1000).toString();
const payloadString = JSON.stringify(payload);

const toSign = `${msgId}.${timestamp}.${payloadString}`;
const signatureBytes = crypto.createHmac("sha256", secretBytes).update(toSign).digest("base64");
const signature = `v1,${signatureBytes}`;

fetch("https://startupverse-gilt.vercel.app/api/clerk/webhook", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "svix-id": msgId,
    "svix-timestamp": timestamp,
    "svix-signature": signature
  },
  body: payloadString
})
.then(async r => {
  console.log("Status:", r.status);
  console.log("Response:", await r.text());
})
.catch(console.error);
