'use client';

import { User } from '@/types';

interface Props {
  user: User | null;
  isConnected: boolean;
  onLogout: () => void;
}

export default function Navbar({ user, isConnected, onLogout }: Props) {
  return (
    <nav className="border-b border-gray-800 px-4 md:px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xl">📈</span>
        <span className="font-bold text-lg">Paper Trading</span>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <span className={`text-xs px-2 py-1 rounded-full ${
          isConnected ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-400'
        }`}>
          {isConnected ? '● Live' : '○ Connecting...'}
        </span>
        <span className="text-gray-400 text-sm hidden md:block">Hello, {user?.name}</span>
        <button
          onClick={onLogout}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}