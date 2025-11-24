/**
 * NextAuth Type Definitions
 *
 * NextAuthの型定義を拡張
 * カスタムフィールドをSession/JWTに追加
 */

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Userインターフェースの拡張
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    isActive?: boolean;
  }

  /**
   * Sessionインターフェースの拡張
   */
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      isActive: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  /**
   * JWTインターフェースの拡張
   */
  interface JWT {
    id: string;
    role: string;
    isActive: boolean;
    provider?: string;
  }
}
