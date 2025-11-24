/**
 * Encryption Service
 *
 * AES-256-GCM暗号化サービス
 * APIキーやセンシティブな情報を安全に暗号化・復号化します
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * 暗号化データ構造
 */
export interface EncryptedData {
  encrypted: string; // 暗号化されたデータ（hex）
  iv: string;        // 初期化ベクトル（hex）
  authTag: string;   // 認証タグ（hex）
}

/**
 * 暗号化サービスクラス
 */
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16; // 128ビット
  private readonly authTagLength = 16; // 128ビット
  private readonly key: Buffer;

  constructor() {
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error(
        'ENCRYPTION_KEY environment variable is not set. ' +
        'Generate one with: openssl rand -hex 32'
      );
    }

    // 環境変数のキーをBufferに変換（hex形式を想定）
    this.key = Buffer.from(encryptionKey, 'hex');

    // キーの長さ検証（32バイト = 256ビット）
    if (this.key.length !== 32) {
      throw new Error(
        'ENCRYPTION_KEY must be 32 bytes (64 hex characters). ' +
        `Current length: ${this.key.length} bytes`
      );
    }
  }

  /**
   * 平文を暗号化
   *
   * @param plaintext - 暗号化する平文
   * @returns 暗号化データ（encrypted, iv, authTag）
   */
  encrypt(plaintext: string): EncryptedData {
    try {
      // ランダムな初期化ベクトル（IV）を生成
      const iv = randomBytes(this.ivLength);

      // 暗号化オブジェクトを作成
      const cipher = createCipheriv(this.algorithm, this.key, iv);

      // 暗号化実行
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // 認証タグを取得（GCMモードの改ざん検知用）
      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      throw new Error(
        `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * 暗号化データを復号化
   *
   * @param data - 暗号化データ
   * @returns 復号化された平文
   * @throws 認証タグが一致しない場合（改ざん検知）
   */
  decrypt(data: EncryptedData): string {
    try {
      // IVと認証タグをBufferに変換
      const iv = Buffer.from(data.iv, 'hex');
      const authTag = Buffer.from(data.authTag, 'hex');

      // 復号化オブジェクトを作成
      const decipher = createDecipheriv(this.algorithm, this.key, iv);

      // 認証タグを設定（GCMモードの改ざん検知）
      decipher.setAuthTag(authTag);

      // 復号化実行
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      // 認証タグエラーの場合は改ざんの可能性
      if (error instanceof Error && error.message.includes('auth')) {
        throw new Error(
          'Decryption failed: Data may have been tampered with (auth tag mismatch)'
        );
      }

      throw new Error(
        `Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * APIキーをマスキング表示
   *
   * 例: "sk-1234567890abcdef" → "●●●●●●●●●●●●cdef"
   *
   * @param apiKey - マスキングするAPIキー
   * @param visibleChars - 末尾に表示する文字数（デフォルト: 4）
   * @returns マスキングされた文字列
   */
  maskApiKey(apiKey: string, visibleChars: number = 4): string {
    if (!apiKey || apiKey.length <= visibleChars) {
      return '●'.repeat(apiKey?.length || 8);
    }

    const maskedPart = '●'.repeat(apiKey.length - visibleChars);
    const visiblePart = apiKey.slice(-visibleChars);

    return maskedPart + visiblePart;
  }

  /**
   * キーローテーション用: 古いキーで復号化して新しいキーで再暗号化
   *
   * @param data - 古いキーで暗号化されたデータ
   * @param oldKey - 古い暗号化キー（hex）
   * @returns 新しいキーで再暗号化されたデータ
   */
  rotateKey(data: EncryptedData, oldKey: string): EncryptedData {
    try {
      // 古いキーで復号化
      const oldKeyBuffer = Buffer.from(oldKey, 'hex');
      const iv = Buffer.from(data.iv, 'hex');
      const authTag = Buffer.from(data.authTag, 'hex');

      const decipher = createDecipheriv(this.algorithm, oldKeyBuffer, iv);
      decipher.setAuthTag(authTag);

      let plaintext = decipher.update(data.encrypted, 'hex', 'utf8');
      plaintext += decipher.final('utf8');

      // 新しいキーで再暗号化
      return this.encrypt(plaintext);
    } catch (error) {
      throw new Error(
        `Key rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * ランダムなAPIキー生成（テスト/開発用）
   *
   * @param prefix - プレフィックス（例: "sk-", "app-"）
   * @param length - ランダム部分の長さ（デフォルト: 32）
   * @returns 生成されたAPIキー
   */
  generateRandomKey(prefix: string = '', length: number = 32): string {
    const randomPart = randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);

    return prefix + randomPart;
  }
}

// シングルトンインスタンスをエクスポート
export const encryptionService = new EncryptionService();
