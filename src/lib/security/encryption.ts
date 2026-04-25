import crypto from "crypto";

/**
 * 暗号化・復号化ユーティリティ
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * 暗号化鍵を取得
 */
async function getEncryptionKey(): Promise<Buffer> {
  if (process.env.NODE_ENV === "production") {
    if (!process.env.ENCRYPTION_KEY) {
      throw new Error(
        "ENCRYPTION_KEY is required in production. Consider using AWS Secrets Manager."
      );
    }
    return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  } else {
    if (!process.env.ENCRYPTION_KEY) {
      console.warn(
        "[DEV WARNING] ENCRYPTION_KEY not set. Using default key for development."
      );
      return crypto.scryptSync("dev-default-key", "salt", 32);
    }
    return Buffer.from(process.env.ENCRYPTION_KEY, "hex");
  }
}

/**
 * データを暗号化
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, "hex"),
    ]);

    return combined.toString("base64");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * データを復号化
 */
export async function decrypt(ciphertext: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const combined = Buffer.from(ciphertext, "base64");

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString("hex"), "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * パスワードをハッシュ化（一方向）
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
}

/**
 * パスワードを検証
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return hash === verifyHash;
}

/**
 * 暗号化鍵を生成（初期セットアップ用）
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
