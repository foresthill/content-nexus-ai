'use client';

/**
 * Session Provider Component
 *
 * NextAuthのSessionProviderをラップし、
 * アプリケーション全体でセッション状態を利用可能にする
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
