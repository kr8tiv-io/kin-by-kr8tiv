import crypto from "node:crypto";

const SECRET_BOX_VERSION = "v1";
const SECRET_BOX_ALGO = "aes-256-gcm";
const SALT_BYTES = 16;
const IV_BYTES = 12;

function assertNonEmpty(value, label) {
  const text = String(value ?? "").trim();
  if (!text) {
    throw new Error(`${label} is empty`);
  }
  return text;
}

function deriveKey(passphrase, salt) {
  return crypto.scryptSync(passphrase, salt, 32);
}

export function encryptSecretBox(plaintext, passphrase) {
  const plain = assertNonEmpty(plaintext, "plaintext");
  const pass = assertNonEmpty(passphrase, "passphrase");

  const salt = crypto.randomBytes(SALT_BYTES);
  const iv = crypto.randomBytes(IV_BYTES);
  const key = deriveKey(pass, salt);
  const cipher = crypto.createCipheriv(SECRET_BOX_ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    SECRET_BOX_VERSION,
    salt.toString("base64"),
    iv.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64")
  ].join(":");
}

export function decryptSecretBox(payload, passphrase) {
  const text = assertNonEmpty(payload, "encrypted secret");
  const pass = assertNonEmpty(passphrase, "TREASURY_KEY_PASSPHRASE");
  const parts = text.split(":");

  if (parts.length !== 5 || parts[0] !== SECRET_BOX_VERSION) {
    throw new Error("Invalid encrypted secret format");
  }

  const [, saltB64, ivB64, tagB64, ciphertextB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ciphertext = Buffer.from(ciphertextB64, "base64");
  const key = deriveKey(pass, salt);
  const decipher = crypto.createDecipheriv(SECRET_BOX_ALGO, key, iv);
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Unable to decrypt treasury key. Check TREASURY_KEY_PASSPHRASE.");
  }
}

export function decryptTreasuryPrivateKey(config) {
  const encrypted = String(config?.treasuryPrivateKeyEncrypted ?? "").trim();
  if (encrypted) {
    const passphrase = String(config?.treasuryKeyPassphrase ?? "").trim();
    if (!passphrase) {
      throw new Error("TREASURY_KEY_PASSPHRASE is required when TREASURY_PRIVATE_KEY_ENCRYPTED is set");
    }
    return decryptSecretBox(encrypted, passphrase);
  }

  const plain = String(config?.treasuryPrivateKey ?? "").trim();
  if (!plain) {
    throw new Error("TREASURY_PRIVATE_KEY is empty");
  }

  return plain;
}
