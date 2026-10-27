import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-between items-center transition-colors duration-300">
    <div className="flex items-center">
      <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">Krtakan</Link>
    </div>
    <div className="flex items-center gap-4">
      <Link to="/about" className="text-gray-600 dark:text-gray-300">About</Link>
      <Link to="/login" className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Login</Link>
      <button
        onClick={toggleTheme}
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        aria-label="Toggle Theme"
      >
        <span>Toggle Theme</span>
      </button>
    </div>
    </nav>
  );
};