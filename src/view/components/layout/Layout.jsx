import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DeveloperPanel from '../ui/DeveloperPanel';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
      
      {/* Developer Panel - Only in development */}
      <DeveloperPanel />
    </div>
  );
};

export default Layout;