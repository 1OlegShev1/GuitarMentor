"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useState } from 'react';

const Navigation = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Fretboard', path: '/fretboard' },
    { name: 'Scales', path: '/scales' },
    { name: 'CAGED System', path: '/caged' },
    { name: 'Chord Progressions', path: '/progressions' },
    { name: 'Jam Assistant', path: '/jam-assistant' },
    { name: 'Tools', path: '/tools' },
  ];
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <nav className="bg-white dark:bg-secondary-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-secondary-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center px-2 text-secondary-900 dark:text-white font-bold hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <span className="text-xl md:text-2xl tracking-tight">Guitar<span className="text-primary-600 dark:text-primary-400">Mentor</span></span>
            </Link>
          </div>
          
          {/* Main nav - desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.path 
                    ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-secondary-800' 
                    : 'text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-secondary-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Theme toggle - desktop */}
            <div className="ml-3">
              <ThemeToggle />
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <ThemeToggle />
            
            <button 
              className="ml-2 p-2 rounded-md text-secondary-700 dark:text-secondary-300 hover:bg-gray-100 dark:hover:bg-secondary-800 focus:outline-none"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              <svg 
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg 
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div 
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-secondary-800">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === item.path 
                  ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-secondary-800' 
                  : 'text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-secondary-800'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 