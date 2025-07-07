import { PrismaClient } from '@prisma/client';

// PrismaClientのシングルトンインスタンスを作成
// 開発環境でのホットリロード時に複数のインスタンスが作成されるのを防ぐ

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// エラーハンドリングのヘルパー関数
export async function handlePrismaError<T>(
  operation: () => Promise<T>,
  errorMessage = 'Database operation failed'
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    console.error('Prisma error:', error);
    
    // Prismaのエラーコードに基づいた具体的なエラーメッセージ
    if (error.code === 'P2002') {
      throw new Error('This record already exists');
    }
    if (error.code === 'P2025') {
      throw new Error('Record not found');
    }
    if (error.code === 'P2003') {
      throw new Error('Foreign key constraint failed');
    }
    if (error.code === 'P2014') {
      throw new Error('The change would violate a relation');
    }
    
    throw new Error(errorMessage);
  }
}