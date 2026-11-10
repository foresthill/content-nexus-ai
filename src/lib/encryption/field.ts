/**
 * 単一カラムに自己完結で格納できる形式でフィールドを暗号化する。
 * SocialAccount の認証カラム(iv/authTag 用のカラムが無い)を、スキーマ変更なしで
 * at-rest 暗号化するために使う。形式: `enc:v1:<iv>:<authTag>:<ciphertext>`(すべてhex)。
 *
 * decryptField は後方互換: プレフィックスが無い値(旧平文/未暗号化)はそのまま返す。
 */
import { getEncryptionService } from './service';

const PREFIX = 'enc:v1:';

export function encryptField(plaintext: string | null | undefined): string {
  if (!plaintext) return plaintext ?? '';
  const { encrypted, iv, authTag } = getEncryptionService().encrypt(plaintext);
  return `${PREFIX}${iv}:${authTag}:${encrypted}`;
}

export function decryptField(value: string | null | undefined): string {
  if (!value) return value ?? '';
  if (!value.startsWith(PREFIX)) return value; // 旧平文などはそのまま（後方互換）
  const parts = value.split(':');
  // parts = ['enc','v1', iv, authTag, ciphertext]
  const [, , iv, authTag, encrypted] = parts;
  if (!iv || !authTag || !encrypted) return value;
  return getEncryptionService().decrypt({ encrypted, iv, authTag });
}
