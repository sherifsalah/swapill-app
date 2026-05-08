import React, { useState } from 'react';
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Github, Chrome, Eye, EyeOff } from "lucide-react";
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Attempting sign up with:', email);
      
      // Sign up with Supabase - CRITICAL: Use full_name to match trigger
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name  // MUST be 'full_name' to match trigger
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        if (error.message.includes('already registered')) {
          toast.error('Email already exists. Please log in instead.');
        } else {
          toast.error(error.message || 'Failed to create account');
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('Sign up successful:', data.user.email);
        console.log('User ID:', data.user.id);
        
        // Profile creation is now handled by database trigger - no frontend creation needed
        console.log('Profile will be created automatically by database trigger for user:', data.user.id);
        
        // No frontend profile creation - database trigger handles it
        console.log('Skipping frontend profile creation - relying on auto-trigger');

                  
        toast.success('Account created successfully!');
        
        // Automatically sign in the user after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          console.error('Auto sign in error:', signInError);
          toast.error('Account created but automatic login failed. Please try logging in manually.');
        } else {
          console.log('Auto sign in successful - waiting for profile creation before redirect');
          
          // Wait for database trigger to create profile record
          setTimeout(async () => {
            // Refresh session to get latest user data
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
              console.log('Session confirmed, navigating to profile');
              navigate('/profile');
            } else {
              console.error('No session found after delay');
              toast.error('Login successful. Please try refreshing the page.');
            }
          }, 2000); // 2 second delay to allow database trigger
        }
         
      } else {
        toast.error('No user data returned');
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      toast.error('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // OAuth handlers
  const handleGoogleSignUp = async () => {
    try {
      console.log('Initiating Google sign up...');
      toast.success('Redirecting to Google...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('Google sign up error:', error);
        toast.error('Failed to sign up with Google');
      }
      
    } catch (error) {
      console.error('Google sign up error:', error);
      toast.error('Failed to sign up with Google');
    }
  };

  const handleGithubSignUp = async () => {
    try {
      console.log('Initiating GitHub sign up...');
      toast.success('Redirecting to GitHub...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        console.error('GitHub sign up error:', error);
        toast.error('Failed to sign up with GitHub');
      }
      
    } catch (error) {
      console.error('GitHub sign up error:', error);
      toast.error('Failed to sign up with GitHub');
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center p-6 relative overflow-hidden bg-[#0f172a]">
      {/* Background Decals */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full glass-card p-10 border-white/20"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/20">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Join Swapill</h1>
          <p className="text-slate-400">Start your skill swapping journey</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
               <input 
                type="text" 
                name="name"
                placeholder="John Doe"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 transition-all focus:bg-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
               <input 
                type="email" 
                name="email"
                placeholder="name@example.com"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 transition-all focus:bg-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
               <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 transition-all focus:bg-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
               <input 
                type="password" 
                name="confirmPassword"
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 transition-all focus:bg-white/10"
              />
            </div>
          </div>

          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex justify-center text-xs uppercase font-bold text-slate-600 bg-transparent px-4 mt-8">
            <span className="px-2 backdrop-blur-md">Or continue with</span>
         </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
           <button 
             type="button"
             onClick={handleGoogleSignUp}
             className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
           >
              <Chrome className="w-4 h-4" />
              Google
           </button>
           <button 
             type="button"
             onClick={handleGithubSignUp}
             className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium"
           >
              <Github className="w-4 h-4" />
              GitHub
           </button>
        </div>

        <div className="mt-10 text-center text-sm text-slate-400">
           Already have an account? <Link to="/login" className="text-purple-400 font-bold hover:underline">Log in</Link>
        </div>
      </motion.div>
    </div>
  );
}