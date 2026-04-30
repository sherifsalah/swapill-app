import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast.error('Authentication failed');
          navigate('/login');
          return;
        }

        if (data.session) {
          const user = data.session.user;
          
          // Extract user data
          const userData = {
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            country: user.user_metadata?.country || 'US',
            joinDate: new Date().toISOString(),
            uid: user.id,
            photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture
          };
          
          // Save to localStorage
          localStorage.setItem('swapill_user', JSON.stringify(userData));
          
          // Show success message
          toast.success(`Welcome, ${userData.name}!`);
          
          // Redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session found, redirect to login
          toast.error('No authentication session found');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <div className="text-center">
        <p className="text-white text-lg">Redirecting...</p>
      </div>
    </div>
  );
}
