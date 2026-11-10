/**
 * ApiKeyService
 *
 * ユーザーごとのAPIキーを暗号化して DB(ApiKey テーブル) に永続化する。
 * - 平文キーを受け取り AES-256-GCM で暗号化して保存
 * - 取得時に復号して平文を返す（サーバーサイド利用のみ）
 * - 表示用にはマスク済み文字列を返す
 *
 * ApiKey テーブルには (userId, serviceType, name) の unique 制約が無いため、
 * upsert ではなく findFirst → update / create で冪等に扱う。
 */
import type { ServiceType } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getEncryptionService } from '@/lib/encryption/service';

export interface SaveApiKeyParams {
  userId: string;
  serviceType: ServiceType;
  name: string;
  /** 平文のAPIキー */
  apiKey: string;
  /** サービス固有の追加情報（モデル名など）。null でクリア可能 */
  metadata?: Record<string, unknown> | null;
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  serviceType: ServiceType;
  /** 復号済みの平文キー（サーバーサイド利用のみ） */
  apiKey: string;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
}

function findExisting(userId: string, serviceType: ServiceType, name: string) {
  return prisma.apiKey.findFirst({
    where: { userId, serviceType, name },
  });
}

/**
 * APIキーを暗号化して保存（既存があれば更新）。
 */
export async function saveApiKey(params: SaveApiKeyParams): Promise<void> {
  const { userId, serviceType, name, apiKey, metadata } = params;
  const { encrypted, iv, authTag } = getEncryptionService().encrypt(apiKey);

  const existing = await findExisting(userId, serviceType, name);

  const data = {
    encryptedKey: encrypted,
    iv,
    authTag,
    metadata: (metadata ?? undefined) as object | undefined,
    isActive: true,
  };

  if (existing) {
    await prisma.apiKey.update({ where: { id: existing.id }, data });
  } else {
    await prisma.apiKey.create({
      data: { userId, serviceType, name, ...data },
    });
  }
}

/**
 * metadata だけを更新する（キー本体は変更しない）。
 * 既存レコードが無い場合は何もしない（false を返す）。
 */
export async function updateMetadata(
  userId: string,
  serviceType: ServiceType,
  name: string,
  metadata: Record<string, unknown> | null
): Promise<boolean> {
  const existing = await findExisting(userId, serviceType, name);
  if (!existing) return false;
  await prisma.apiKey.update({
    where: { id: existing.id },
    data: { metadata: (metadata ?? undefined) as object | undefined },
  });
  return true;
}

/**
 * 復号済みの平文キーを取得（サーバーサイド利用のみ）。無ければ null。
 */
export async function getApiKey(
  userId: string,
  serviceType: ServiceType,
  name: string
): Promise<ApiKeyRecord | null> {
  const record = await findExisting(userId, serviceType, name);
  if (!record || !record.isActive) return null;

  const apiKey = getEncryptionService().decrypt({
    encrypted: record.encryptedKey,
    iv: record.iv,
    authTag: record.authTag,
  });

  // 利用時刻を記録（失敗しても致命的ではない）
  prisma.apiKey
    .update({ where: { id: record.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  return {
    id: record.id,
    name: record.name,
    serviceType: record.serviceType,
    apiKey,
    metadata: (record.metadata as Record<string, unknown> | null) ?? null,
    isActive: record.isActive,
  };
}

/**
 * 表示用のマスク済み情報を取得。平文は返さない。無ければ null。
 */
export async function getMaskedApiKey(
  userId: string,
  serviceType: ServiceType,
  name: string
): Promise<{ maskedKey: string; metadata: Record<string, unknown> | null } | null> {
  const record = await getApiKey(userId, serviceType, name);
  if (!record) return null;
  return {
    maskedKey: getEncryptionService().maskApiKey(record.apiKey),
    metadata: record.metadata,
  };
}

/**
 * APIキーを削除。無ければ何もしない。
 */
export async function deleteApiKey(
  userId: string,
  serviceType: ServiceType,
  name: string
): Promise<void> {
  await prisma.apiKey.deleteMany({ where: { userId, serviceType, name } });
}
