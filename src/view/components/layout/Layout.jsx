import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DeveloperPanel from '../ui/DeveloperPanel';
import { useUser } from '../../../controller/hooks/useUser';

/**
 * Layout Component with Theme Support
 * 
 * Phase 2 Implementation: Applies theme classes and handles theme switching
 */
const Layout = ({ children }) => {
  const { getCurrentTheme, isDarkMode } = useUser();
  const currentTheme = getCurrentTheme();
  
  // Apply theme to document root on mount and theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Add theme transition class for smooth transitions
    document.body.classList.add('theme-transition');
    
    return () => {
      document.body.classList.remove('theme-transition');
    };
  }, [currentTheme]);
  
  return (
    <div className="flex h-screen theme-transition" style={{
      backgroundColor: 'var(--bg-primary)'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6" style={{
          backgroundColor: 'var(--bg-primary)'
        }}>
          {children}
        </main>
      </div>
      
      {/* Developer Panel - Only in development */}
      <DeveloperPanel />
    </div>
  );
};

export default Layout;