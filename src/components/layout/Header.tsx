import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Kreativium
        </Link>
        <div className="flex items-center space-x-4">
          {/* Placeholder for navigation/actions */}
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            {/* Placeholder for User Avatar */}
            <span className="text-sm">U</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
