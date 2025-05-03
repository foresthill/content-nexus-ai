import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                ContentNexus
              </Link>
            </div>
            <nav className="ml-6 flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link href="/content" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Content
              </Link>
              <Link href="/videos" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Videos
              </Link>
              <Link href="/comments" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                Comments
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            <button className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Create New
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;