/**
 * 結合テスト: encryptField/decryptField の往復と後方互換。
 * ENCRYPTION_KEY を使用（DB不要）。env無しは自動スキップ。
 */
import { encryptField, decryptField } from '@/lib/encryption/field';

const canRun = !!process.env.ENCRYPTION_KEY;
const describeOrSkip = canRun ? describe : describe.skip;

describeOrSkip('encryptField / decryptField', () => {
  it('暗号化→復号で元に戻る', () => {
    const plain = 'twitter-access-token-abcdef123456';
    const enc = encryptField(plain);
    expect(enc.startsWith('enc:v1:')).toBe(true);
    expect(enc).not.toContain(plain);
    expect(decryptField(enc)).toBe(plain);
  });

  it('プレフィックスの無い値(旧平文)はそのまま返す（後方互換）', () => {
    expect(decryptField('legacy-plaintext-token')).toBe('legacy-plaintext-token');
  });

  it('空値は空のまま', () => {
    expect(encryptField('')).toBe('');
    expect(encryptField(null)).toBe('');
    expect(decryptField('')).toBe('');
    expect(decryptField(null)).toBe('');
  });
});
