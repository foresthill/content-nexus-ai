'use client';

/**
 * User Button Component
 *
 * ユーザーアバター表示とドロップダウンメニュー
 * - ユーザー情報表示
 * - 設定リンク
 * - ログアウトボタン
 */

import { useSession, signOut } from 'next-auth/react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import Link from 'next/link';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

export function UserButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
    );
  }

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        ログイン
      </Link>
    );
  }

  const { user } = session;

  // ユーザーのイニシャルを取得
  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt={user.name || 'User avatar'}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
              {getInitials(user.name)}
            </div>
          )}
          <span className="hidden md:block text-sm font-medium text-gray-700">
            {user.name || user.email}
          </span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          {/* ユーザー情報 */}
          <div className="px-4 py-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
            {user.role && (
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                <ShieldCheckIcon className="h-3 w-3" />
                {user.role}
              </div>
            )}
          </div>

          {/* メニューアイテム */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/dashboard"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center gap-2 px-4 py-2 text-sm`}
                >
                  <UserCircleIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  ダッシュボード
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link
                  href="/settings"
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex items-center gap-2 px-4 py-2 text-sm`}
                >
                  <Cog6ToothIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  設定
                </Link>
              )}
            </Menu.Item>
          </div>

          {/* ログアウト */}
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleSignOut}
                  className={`${
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                  } group flex w-full items-center gap-2 px-4 py-2 text-sm`}
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                  ログアウト
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
