/**
 * 単体テスト: OpenRouter ユーザー設定の純粋ロジック
 * 外部依存（DB/ネットワーク）なし。npm test で実行される。
 */
import { isMaskedKey, OPENROUTER_DEFAULT_MODEL } from '@/lib/openrouter/user-config';

describe('isMaskedKey', () => {
  it('空文字・undefined はマスク扱い（未変更）', () => {
    expect(isMaskedKey('')).toBe(true);
    expect(isMaskedKey(undefined as unknown as string)).toBe(true);
  });

  it('マスク文字(●)を含む値はマスク扱い', () => {
    expect(isMaskedKey('●●●●●●●●1234')).toBe(true);
  });

  it('通常の平文キーはマスク扱いではない', () => {
    expect(isMaskedKey('sk-or-v1-abcdef0123456789')).toBe(false);
  });
});

describe('OPENROUTER_DEFAULT_MODEL', () => {
  it('現行の推奨モデルを指す', () => {
    expect(OPENROUTER_DEFAULT_MODEL).toBe('anthropic/claude-sonnet-4.6');
  });
});
