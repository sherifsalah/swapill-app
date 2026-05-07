import { motion } from "motion/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, LayoutDashboard, Compass, Info, User, LogOut, Menu, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";
import AuthModal from "../auth/AuthModal";
import { supabase } from "../../config/supabase";
import { useAuth } from "../../App";
import toast from 'react-hot-toast';

interface UserData {
  name: string;
  email: string;
  country: string;
  phone: string;
}

// Modern Avatar Component for Navbar
function UserAvatar({ name, size = "small" }: { name: string; size?: "small" | "medium" }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    medium: "w-10 h-10 text-sm"
  };
  
  const avatarColors = [
    'from-purple-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600'
  ];
  
  const colorIndex = name.charCodeAt(0) % avatarColors.length;
  
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold border-2 border-white/20",
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  // Update current user and fetch avatar_url when auth state changes
  useEffect(() => {
    if (user) {
      const userData: UserData = {
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        country: user.user_metadata?.country || 'Unknown',
        phone: user.phone || ''
      };
      setCurrentUser(userData);
      
      // Fetch avatar_url from profiles table
      fetchUserAvatar(user.id);
      
      // Close auth modal when user is found
      setAuthModalOpen(false);
    } else {
      setCurrentUser(null);
      setUserAvatarUrl(null);
    }
  }, [user]);

  // Fetch user avatar from profiles table
  const fetchUserAvatar = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user avatar:', error);
        setUserAvatarUrl(null);
      } else {
        setUserAvatarUrl(data?.avatar_url || null);
      }
    } catch (error) {
      console.error('Unexpected error fetching avatar:', error);
      setUserAvatarUrl(null);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      console.log('Starting logout process...');
      
      // Call supabase signOut directly to ensure proper logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase signOut error:', error);
        toast.error('Error signing out');
        return;
      }
      
      console.log('Successfully signed out from Supabase');
      
      // Clear all local states
      setCurrentUser(null);
      setLogoutModalOpen(false);
      setAuthModalOpen(false);
      
      // Clear any localStorage data
      localStorage.removeItem('swapill_user');
      
      // Force navigation to home page
      navigate('/', { replace: true });
      
      toast.success('Logged out successfully');
      
    } catch (error) {
      console.error('Unexpected error during logout:', error);
      toast.error('An error occurred during logout');
      
      // Still try to clean up and redirect on error
      setCurrentUser(null);
      setLogoutModalOpen(false);
      setAuthModalOpen(false);
      localStorage.removeItem('swapill_user');
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const cancelLogout = () => {
    if (!isLoggingOut) {
      setLogoutModalOpen(false);
    }
  };

  const navLinks = [
    { name: "Explore", path: "/explore", icon: Compass, requiresAuth: false },
    { name: "How It Works", path: "/how-it-works", icon: Info, requiresAuth: false },
    { name: "Chat", path: "/chat", icon: MessageSquare, requiresAuth: true },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, requiresAuth: true },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-3" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Swapill</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isDisabled = link.requiresAuth && !user;
            return (
              <div key={link.path}>
                {isDisabled ? (
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-not-allowed">
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </span>
                ) : (
                  <Link
                    to={link.path}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium transition-colors hover:text-white",
                      location.pathname === link.path ? "text-white" : "text-slate-400"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {user && currentUser ? (
            <div className="flex items-center gap-4">
              {userAvatarUrl ? (
                <Link to="/profile" className="flex items-center gap-2 group p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <img 
                    src={userAvatarUrl} 
                    alt={currentUser?.name} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-slate-950"
                  />
                  <span className="text-sm font-medium text-gray-200 hidden sm:block">{currentUser?.name}</span>
                </Link>
              ) : (
                <div className="flex items-center gap-2 group p-1 pr-3 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 border-2 border-slate-950">
                  <span className="text-white font-bold text-sm">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="text-sm font-medium text-gray-200 hidden sm:block">{currentUser?.name}</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full h-10 w-10 flex items-center justify-center bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  setAuthMode('login');
                  setAuthModalOpen(true);
                }}
                className="text-sm font-medium text-gray-300 hover:text-white px-4 py-2 transition-colors"
              >
                Login
              </button>
              <button 
                onClick={() => {
                  setAuthMode('signup');
                  setAuthModalOpen(true);
                }}
                className="btn-primary text-sm px-6 py-2"
              >
                Sign Up
              </button>
            </div>
          )}
          <button className="md:hidden p-2 text-slate-400 hover:text-white transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
      {!loading && !user && (
        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          onModeChange={setAuthMode}
          onAuthSuccess={() => {
            // Auth success is handled by AuthProvider, no action needed here
          }}
        />
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50"
          onClick={cancelLogout}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            {!isLoggingOut && (
              <button
                onClick={cancelLogout}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}

            {/* Content */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <LogOut className="w-8 h-8 text-red-400" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                {isLoggingOut ? 'Logging out...' : 'Do you want to log out?'}
              </h3>
              
              <p className="text-gray-300 mb-8">
                {isLoggingOut 
                  ? 'Please wait while we sign you out securely...'
                  : 'You can always come back and continue your skill swapping journey.'
                }
              </p>

              {/* Loading spinner or buttons */}
              {isLoggingOut ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={cancelLogout}
                    className="flex-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmLogout}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:from-red-400 hover:to-orange-500 transition-all font-medium shadow-lg shadow-red-500/25"
                  >
                    Yes, Log Out
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </nav>
  );
}
