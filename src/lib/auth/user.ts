import { prisma, handlePrismaError } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '@prisma/client';

// JWT設定
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN = '7d';

// ユーザー作成用の型
export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}

// ユーザー更新用の型
export interface UpdateUserInput {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

// JWTペイロード
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// 認証レスポンス
export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export class UserService {
  /**
   * 新規ユーザー作成
   */
  static async createUser(input: CreateUserInput): Promise<AuthResponse> {
    return handlePrismaError(async () => {
      // パスワードのハッシュ化
      const hashedPassword = await bcrypt.hash(input.password, 10);

      // ユーザー作成
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: input.role || UserRole.USER,
        },
      });

      // パスワードを除外
      const { password, ...userWithoutPassword } = user;

      // JWTトークン生成
      const token = this.generateToken(user);

      return {
        user: userWithoutPassword,
        token,
      };
    }, 'Failed to create user');
  }

  /**
   * ユーザーログイン
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    return handlePrismaError(async () => {
      // ユーザー検索
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        throw new Error('Invalid email or password');
      }

      // アクティブチェック
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // パスワード検証（型ガードでnullチェック済み）
      const isPasswordValid = await bcrypt.compare(password, user.password as string);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // パスワードを除外
      const { password: _, ...userWithoutPassword } = user;

      // JWTトークン生成
      const token = this.generateToken(user);

      return {
        user: userWithoutPassword,
        token,
      };
    }, 'Login failed');
  }

  /**
   * ユーザー情報取得
   */
  static async getUserById(userId: string): Promise<Omit<User, 'password'> | null> {
    return handlePrismaError(async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    }, 'Failed to get user');
  }

  /**
   * ユーザー更新
   */
  static async updateUser(
    userId: string,
    input: UpdateUserInput
  ): Promise<Omit<User, 'password'>> {
    return handlePrismaError(async () => {
      const updateData: any = { ...input };

      // パスワードが含まれている場合はハッシュ化
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 10);
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          emailVerified: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    }, 'Failed to update user');
  }

  /**
   * ユーザー削除（論理削除）
   */
  static async deleteUser(userId: string): Promise<void> {
    return handlePrismaError(async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
    }, 'Failed to delete user');
  }

  /**
   * JWTトークン生成
   */
  private static generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * JWTトークン検証
   */
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * ユーザー一覧取得（管理者用）
   */
  static async getUsers(
    skip = 0,
    take = 10,
    role?: UserRole
  ): Promise<{ users: Omit<User, 'password'>[]; total: number }> {
    return handlePrismaError(async () => {
      const where = role ? { role } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            role: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where }),
      ]);

      return { users, total };
    }, 'Failed to get users');
  }

  /**
   * パスワードリセットトークン生成（将来の実装用）
   */
  static generateResetToken(userId: string): string {
    return jwt.sign({ userId, type: 'reset' }, JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * メールアドレス検証（将来の実装用）
   */
  static generateVerificationToken(userId: string): string {
    return jwt.sign({ userId, type: 'verify' }, JWT_SECRET, { expiresIn: '24h' });
  }
}