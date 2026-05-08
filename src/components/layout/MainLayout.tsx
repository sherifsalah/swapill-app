import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GlobalSidebar from './GlobalSidebar';
import MinimalHeader from './MinimalHeader';
import LogoutModal from '../shared/LogoutModal';

interface MainLayoutProps {
  children: React.ReactNode;
  conversationsCount?: number;
}

export default function MainLayout({ children, conversationsCount }: MainLayoutProps) {
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [localConversationsCount, setLocalConversationsCount] = useState(0);

  // Listen for logout modal events and conversations count updates
  useEffect(() => {
    const handleOpenLogoutModal = () => {
      setLogoutModalOpen(true);
    };

    const handleUpdateConversationsCount = (event: any) => {
      setLocalConversationsCount(event.detail);
    };

    window.addEventListener('openLogoutModal', handleOpenLogoutModal);
    window.addEventListener('updateConversationsCount', handleUpdateConversationsCount);
    
    return () => {
      window.removeEventListener('openLogoutModal', handleOpenLogoutModal);
      window.removeEventListener('updateConversationsCount', handleUpdateConversationsCount);
    };
  }, []);

  const isChatPage = location.pathname === '/chat';
  
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Global Sidebar - Always show on all pages */}
      <GlobalSidebar setIsLogoutModalOpen={setLogoutModalOpen} />
      
      {/* Main Content Area - with margin-left to account for fixed sidebar */}
      <div className={`ml-56 ${isChatPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
        {/* Minimal Header - Hide on Chat page for full-screen experience */}
        {!isChatPage && <MinimalHeader conversationsCount={localConversationsCount} />}
        
        {/* Page Content */}
        <main className={`${isChatPage ? 'flex-1 overflow-hidden p-0 m-0' : 'overflow-auto'} ${!isChatPage ? 'pt-6' : 'pt-0'}`}>
          {children}
        </main>
      </div>

      {/* Global Logout Modal */}
      <LogoutModal 
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
