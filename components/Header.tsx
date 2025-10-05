
import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const MenuIcon = () => (
  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMenuClick} 
          className="p-2 -ml-2 text-gray-600 rounded-md md:hidden hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>
        <div className="hidden sm:flex items-center space-x-3">
          <div className="bg-gray-800 p-2 rounded-md">
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">RASMAL GROUP</h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
