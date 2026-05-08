import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Compass, 
  Info, 
  MessageCircle, 
  LayoutDashboard, 
  LogOut, 
  Home,
  LogIn,
  User,
  UserPlus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../App';

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  requiresAuth?: boolean;
}

interface GlobalSidebarProps {
  setIsLogoutModalOpen: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function GlobalSidebar({ setIsLogoutModalOpen, isOpen, onClose }: GlobalSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems: NavItem[] = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Info, label: 'How It Works', path: '/how-it-works' },
    { icon: MessageCircle, label: 'Chat', path: '/chat', requiresAuth: true },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', requiresAuth: true },
    { icon: UserPlus, label: 'Requests', path: '/requests', requiresAuth: true },
    { icon: User, label: 'Profile', path: '/profile', requiresAuth: true },
  ];

  
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      
      <nav className={`fixed left-0 top-0 h-screen bg-[#0f172a] flex flex-col py-6 border-r border-slate-800 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:relative lg:inset-0 lg:z-auto`}>
      {/* Logo */}
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800/50 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Swapill</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isDisabled = item.requiresAuth && !user;
          
          return (
            <button
              key={item.path}
              onClick={() => !isDisabled && navigate(item.path)}
              disabled={isDisabled}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left',
                isActive 
                  ? 'bg-purple-600/20 text-white font-semibold border-l-4 border-purple-500' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Auth Button */}
      <div className="mt-auto">
        {user ? (
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left text-slate-400 hover:text-red-400 hover:bg-slate-800/50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 w-full text-left text-slate-400 hover:text-purple-400 hover:bg-slate-800/50"
          >
            <LogIn className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Login</span>
          </button>
        )}
      </div>
    </nav>
    </>
  );
}
