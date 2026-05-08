import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import GlobalSidebar from './GlobalSidebar';
import Header from './Header';
import LogoutModal from '../shared/LogoutModal';
import { useAuth } from '../../App';
import { useUserProfile } from '../../contexts/UserProfileContext';

// User Avatar Component for Mobile Header
function UserAvatar({ avatarUrl, name }: { avatarUrl?: string; name: string }) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (avatarUrl && !avatarUrl.includes('dicebear.com')) {
    return (
      <div className="relative">
        <img 
          src={avatarUrl}
          alt={name}
          className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
        />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
      <span className="text-white font-bold text-xs">
        {getInitials(name)}
      </span>
    </div>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
  conversationsCount?: number;
}

export default function MainLayout({ children, conversationsCount }: MainLayoutProps) {
  const location = useLocation();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [localConversationsCount, setLocalConversationsCount] = useState(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { currentUser: userProfile } = useUserProfile();

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
    <div className="flex flex-col lg:flex-row h-screen bg-[#0f172a]">
      {/* Mobile Header - Only shows on small screens */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="text-white font-semibold">Menu</span>
        </div>
        
        {/* User Avatar in Mobile Header */}
        <div className="flex items-center gap-3">
          {user && (
            <Link to="/profile" className="flex items-center gap-2 group">
              <UserAvatar 
                avatarUrl={userProfile?.avatar_url}
                name={userProfile?.name || user.email?.split('@')[0] || 'User'}
              />
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      {/* Global Sidebar - Hidden on mobile, visible on desktop */}
      <GlobalSidebar 
        setIsLogoutModalOpen={setLogoutModalOpen}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Desktop Header - Only shows on large screens */}
        <header className="hidden lg:block">
          <Header />
        </header>
        
        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto w-full ${
          isChatPage 
            ? 'p-0' 
            : 'p-4'
        }`}>
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
