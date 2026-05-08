import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../App';
import { useUserProfile } from '../../contexts/UserProfileContext';

// User Avatar Component for Header
function UserAvatar({ avatarUrl, name }: { avatarUrl?: string; name: string }) {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent && !parent.querySelector('.fallback-circle')) {
      const fallback = document.createElement('div');
      fallback.className = 'fallback-circle absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-pink-500 rounded-full text-white font-bold text-sm';
      fallback.textContent = getInitials(name);
      parent.appendChild(fallback);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.style.opacity = '1';
  };

  if (avatarUrl && !avatarUrl.includes('dicebear.com')) {
    return (
      <div className="relative">
        <img 
          src={avatarUrl}
          alt={name}
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ opacity: '0', transition: 'opacity 0.3s ease' }}
          className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
        />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center border-2 border-white/20">
      <span className="text-white font-bold text-sm">
        {getInitials(name)}
      </span>
    </div>
  );
}

export default function Header() {
  const { user, loading } = useAuth();
  const { currentUser: userProfile } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    // This will be handled by the parent component
    const event = new CustomEvent('openLogoutModal');
    window.dispatchEvent(event);
  };

  const displayName = userProfile?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatar_url;

  return (
    <>
      <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between">
        {/* Logo/Brand - Empty */}
        <div className="flex items-center">
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Button - Only show if user is logged in */}
          {user && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
          
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              <Link 
                to="/profile" 
                className="flex items-center gap-2 group p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
              >
                <UserAvatar 
                  avatarUrl={avatarUrl}
                  name={displayName}
                />
                <span className="text-sm font-medium text-gray-200 hidden sm:block">
                  {displayName}
                </span>
              </Link>
              <button 
                onClick={handleLogout}
                className="hidden md:flex p-2 rounded-full h-10 w-10 items-center justify-center bg-white/5 border border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            !loading && (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="text-xs md:text-sm font-medium text-gray-300 hover:text-white px-2 md:px-4 py-1 md:py-2 transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-medium px-3 md:px-6 py-1 md:py-2 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
                {/* Mobile Menu Button for Guests */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="bg-slate-900 w-64 h-full border-r border-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <span className="text-white font-bold text-lg">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="space-y-2">
                <Link
                  to="/explore"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Explore
                </Link>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  How It Works
                </Link>
                {!user && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
                {user && (
                  <>
                    <Link
                      to="/chat"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      Chat
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
