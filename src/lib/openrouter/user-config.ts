/**
 * OpenRouter のユーザーごと設定（APIキー・選択モデル）共通ロジック。
 * config / test / generate の各ルートから利用する。
 *
 * OpenRouter は ServiceType enum に無いため CUSTOM + name='openrouter' で保存し、
 * 選択モデルは metadata.model に保持する。
 */
import { getApiKey, type ApiKeyRecord } from '@/lib/apikey/service';

export const OPENROUTER_SERVICE_TYPE = 'CUSTOM' as const;
export const OPENROUTER_SERVICE_NAME = 'openrouter';
export const OPENROUTER_DEFAULT_MODEL = 'anthropic/claude-sonnet-4.6';

/** 送信されたキーがマスク済み（未変更）か判定 */
export function isMaskedKey(value: string): boolean {
  return !value || value.includes('●');
}

/** ログインユーザーの復号済み OpenRouter キーレコードを取得。無ければ null。 */
export function getOpenrouterKeyForUser(userId: string): Promise<ApiKeyRecord | null> {
  return getApiKey(userId, OPENROUTER_SERVICE_TYPE, OPENROUTER_SERVICE_NAME);
}
