import React from 'react';
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react";
import { supabase } from '../config/supabase';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      console.log('Attempting sign in with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return;
      }

      console.log('Sign in successful:', data.user?.email);
      toast.success('Welcome back!');
      
      // Use React Router navigate for proper navigation
      navigate('/explore');
      
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      toast.error('An error occurred. Please try again.');
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
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-400">Continue your swapping journey</p>
        </div>

        <form className="space-y-6" onSubmit={handleSignIn} autoComplete="off">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
               <input 
                type="email" 
                name="email"
                placeholder="name@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 transition-all focus:bg-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <Link to="/forgot" className="text-[10px] uppercase font-bold text-purple-400 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
               <input 
                type="password" 
                name="password"
                autoComplete="current-password"
                placeholder="********"
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-purple-500 transition-all focus:bg-white/10"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-4">
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 relative">
           <div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-white/5"></div></div>
           <div className="relative flex justify-center text-xs uppercase font-bold text-slate-600 bg-transparent px-4">
              <span className="px-2 backdrop-blur-md">Or continue with</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-8">
           <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
              <Chrome className="w-4 h-4" />
              Google
           </button>
           <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-medium">
              <Github className="w-4 h-4" />
              GitHub
           </button>
        </div>

        <div className="mt-10 text-center text-sm text-slate-400">
           Don't have an account? <Link to="/signup" className="text-purple-400 font-bold hover:underline">Join free</Link>
        </div>
      </motion.div>
    </div>
  );
}
