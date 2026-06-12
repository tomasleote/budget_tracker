import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Layout Component
 *
 * The active theme is applied to the document by UserProvider (single source of
 * truth), so the layout no longer manages theme state — it just renders the shell.
 */
const Layout = ({ children }) => {
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
    </div>
  );
};

export default Layout;
