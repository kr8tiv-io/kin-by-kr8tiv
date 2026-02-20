import { encryptSecretBox } from "../src/secret-key.js";

const secret = String(process.env.TREASURY_PRIVATE_KEY_PLAIN ?? "").trim();
const passphrase = String(process.env.TREASURY_KEY_PASSPHRASE ?? "").trim();

if (!secret) {
  console.error("Missing TREASURY_PRIVATE_KEY_PLAIN");
  process.exit(1);
}

if (!passphrase) {
  console.error("Missing TREASURY_KEY_PASSPHRASE");
  process.exit(1);
}

const encrypted = encryptSecretBox(secret, passphrase);
console.log(encrypted);
