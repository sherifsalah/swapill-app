import React, { useState, useEffect } from "react";

import { motion } from "motion/react";

import { Plus, BookOpen, Clock, TrendingUp, Settings, ChevronRight, Edit, User, Trash2 } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";

import { SKILLS, USERS } from "../data/mockData";

import toast from 'react-hot-toast';

import { supabase } from '../config/supabase';

import { useAuth } from '../contexts/AuthContext';

import { useUserProfile } from '../contexts/UserProfileContext.tsx';



interface UserProfile {

  name: string;

  email: string;

  bio: string;

  location: string;

  joinDate: string;

  avatar_url?: string;

  skills: any[];

  endorsements: number;

  exchanges: number;

  trustScore: number;

}



export default function Dashboard() {

  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const { currentUser, loading: profileLoading, updateProfile } = useUserProfile();



  const handleDeleteSkill = async (skillId: string) => {

    try {

      console.log('Deleting skill:', skillId);

      

      if (!user?.id) {

        toast.error('User not authenticated');

        return;

      }

      

      const { error } = await supabase

        .from('skills')

        .delete()

        .eq('id', skillId)

        .eq('user_id', user.id);



      if (error) {

        console.error('Error deleting skill:', error);

        toast.error('Failed to delete skill');

        return;

      }



      toast.success('Skill deleted successfully!');

      

      // Refresh skills from database

      const { data: refreshedSkills, error: refreshError } = await supabase

        .from('skills')

        .select('*')

        .eq('user_id', user.id)

        .order('created_at', { ascending: false });



      if (refreshError) {

        console.error('Error refreshing skills:', refreshError);

        return;

      }



      // Update user state with refreshed skills

      updateProfile({ skills: refreshedSkills || [] });

      

    } catch (error) {

      console.error('Error in handleDeleteSkill:', error);

      toast.error('An error occurred while deleting the skill');

    }

  };



  const handleEditSkill = (skill: any) => {

    if (!user?.id) {

      toast.error('User not authenticated. Please refresh the page.');

      return;

    }

    console.log('Editing skill:', skill);

    // Navigate to profile page with skill context for editing

    navigate('/profile', { state: { userId: user.id, editingSkill: skill } });

  };



  const handleAddSkill = () => {

    if (!user?.id) {

      toast.error('User not authenticated. Please refresh the page.');

      return;

    }

    console.log('Adding skill for user:', user.id);

    // Navigate to profile page with user context

    navigate('/profile', { state: { userId: user.id } });

  };



  const getAvatarDisplay = () => {

    if (!currentUser) return null;

    

    // Use uploaded avatar_url if available, otherwise show initials

    if (currentUser.avatar_url) {

      return (

        <img 

          src={currentUser.avatar_url} 

          alt={currentUser.name} 

          className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl"

          style={{ aspectRatio: '1/1' }}

          onError={(e) => {

            const target = e.target as HTMLImageElement;

            // Fallback to initials circle

            target.style.display = 'none';

            const parent = target.parentElement;

            if (parent && !parent.querySelector('.fallback-circle')) {

              const fallback = document.createElement('div');

              fallback.className = 'fallback-circle absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 rounded-full text-white font-bold text-2xl';

              fallback.textContent = currentUser.name.charAt(0).toUpperCase();

              parent.appendChild(fallback);

            }

          }}

        />

      );

    }

    

    // Default to initials circle

    return (

      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl">

        <span className="text-white font-bold text-2xl">

          {currentUser.name.charAt(0).toUpperCase()}

        </span>

      </div>

    );

  };



  if (profileLoading || authLoading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-900">

        <div className="text-center max-w-md mx-auto px-6">

          {/* Loading Skeleton */}

          <div className="mb-8">

            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-600/20 ring-4 ring-purple-500/10 p-1 bg-slate-800 shadow-xl mx-auto mb-6 animate-pulse">

              <div className="w-full h-full rounded-full bg-slate-700/50"></div>

            </div>

            <div className="space-y-3">

              <div className="h-6 bg-slate-700/50 rounded-lg mx-auto w-32 animate-pulse"></div>

              <div className="h-4 bg-slate-700/30 rounded-lg mx-auto w-48 animate-pulse"></div>

            </div>

          </div>

          

          {/* Loading Spinner */}

          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>

          

          {/* Loading Text */}

          <div className="text-white text-lg font-medium mb-2">

            {authLoading ? 'Initializing authentication...' : 'Loading your profile...'}

          </div>

          <div className="text-slate-400 text-sm">

            {authLoading ? 'Please wait while we establish your session' : 'Fetching your profile data'}

          </div>

          

          {/* Progress indicator */}

          <div className="mt-6 w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">

            <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>

          </div>

        </div>

      </div>

    );

  }



  if (!currentUser) {

    return null; // Will redirect to login

  }



  return (

    <div className="pt-8 pb-24 max-w-7xl mx-auto px-6">

      <div className="flex flex-col lg:flex-row gap-10">

        

        {/* Profile Card Sidebar */}

        <aside className="lg:w-80 space-y-6">

          <div className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-transparent">

            <div className="text-center">

              {getAvatarDisplay()}

              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#1e293b] rounded-full" />

            </div>

            <h2 className="text-xl font-bold mb-1">{currentUser.name}</h2>

            <p className="text-slate-400 text-sm mb-2">{currentUser.location}</p>

            

            {/* Display all skills */}

            {currentUser.skills.length > 0 && (

              <div className="mb-6">

                <div className="flex flex-wrap gap-2">

                  {currentUser.skills.map((skill, index) => (

                    <span 

                      key={skill.id || index}

                      className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"

                    >

                      {skill.title}

                    </span>

                  ))}

                </div>

              </div>

            )}

            

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">

               <div>

                  <div className="text-lg font-bold text-white">{currentUser.exchanges}</div>

                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Swaps</div>

               </div>

               <div>

                  <div className="text-lg font-bold text-white">{currentUser.trustScore > 0 ? currentUser.trustScore.toFixed(1) : 'N/A'}</div>

                  <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Rating</div>

               </div>

            </div>

          </div>



          <div className="glass-card p-4 space-y-1">

             <button className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-500/10 text-purple-400 font-medium">

                <div className="flex items-center gap-3">

                   <TrendingUp className="w-4 h-4" />

                   Overview

                </div>

                <ChevronRight className="w-4 h-4" />

             </button>

             <button className="w-full flex items-center justify-between p-3 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all">

                <div className="flex items-center gap-3">

                   <Settings className="w-4 h-4" />

                   Account Settings

                </div>

                <ChevronRight className="w-4 h-4" />

             </button>

          </div>

        </aside>



        {/* Main Content */}

        <div className="flex-grow space-y-8">

          

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">

             <div className="glass-card p-6 bg-gradient-to-br from-purple-500/5 to-transparent">

                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">

                   <BookOpen className="w-5 h-5" />

                </div>

                <div className="text-2xl font-bold">{currentUser.exchanges}</div>

                <div className="text-sm text-slate-400">Lessons Taught</div>

             </div>

             <div className="glass-card p-6 bg-gradient-to-br from-blue-500/5 to-transparent">

                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">

                   <Clock className="w-5 h-5" />

                </div>

                <div className="text-2xl font-bold">0h</div>

                <div className="text-sm text-slate-400">Total Learning Time</div>

             </div>

             <div className="glass-card p-6 bg-gradient-to-br from-green-500/5 to-transparent">

                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 mb-4">

                   <Plus className="w-5 h-5" />

                </div>

                <div className="text-2xl font-bold">0</div>

                <div className="text-sm text-slate-400">Pending Requests</div>

             </div>

          </div>



          <div className="glass-card p-8">

            <div className="flex items-center justify-between mb-8">

              <h3 className="text-xl font-bold">My Active Skills</h3>

              <button 

                onClick={handleAddSkill}

                className="text-purple-400 text-sm font-bold flex items-center gap-2 hover:underline"

              >

                <Plus className="w-4 h-4" />

                Add New

              </button>

            </div>

            {currentUser.skills.length > 0 ? (

              <div className="space-y-4">

                {currentUser.skills.map((skill) => (

                  <div key={skill.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group">

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-500">

                        {skill.title.charAt(0).toUpperCase()}{skill.title.split(' ').length > 1 ? skill.title.split(' ')[1].charAt(0).toUpperCase() : ''}

                      </div>

                      <div>

                        <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{skill.title}</div>

                        <div className="text-xs text-slate-500 uppercase tracking-widest">{skill.category}</div>

                        <div className="text-sm text-slate-400 mt-1">{skill.description}</div>

                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      <button 

                        onClick={() => handleEditSkill(skill)}

                        className="text-slate-500 hover:text-white transition-colors"

                        title="Edit skill"

                      >

                         <Edit className="w-4 h-4" />

                      </button>

                      <button 

                        onClick={() => handleDeleteSkill(skill.id)}

                        className="text-slate-500 hover:text-red-400 transition-colors"

                        title="Delete skill"

                      >

                         <Trash2 className="w-4 h-4" />

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="text-center py-12">

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">

                  <Plus className="w-8 h-8 text-purple-400" />

                </div>

                <h4 className="text-lg font-semibold text-white mb-2">No skills added yet</h4>

                <p className="text-slate-400 mb-6">Add your first skill to start swapping expertise</p>

                <button 

                  onClick={handleAddSkill}

                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all"

                >

                  <Plus className="w-5 h-5" />

                  Add Your First Skill

                </button>

              </div>

            )}

          </div>



          <div className="glass-card p-8">

            <h3 className="text-xl font-bold mb-8">Recent Activity</h3>

            {currentUser.exchanges > 0 ? (

              <div className="space-y-8">

                {/* Show real activity when user has exchanges */}

                <div className="text-center py-8">

                  <div className="text-slate-400">Activity will appear here as you start swapping!</div>

                </div>

              </div>

            ) : (

              <div className="text-center py-12">

                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6">

                  <User className="w-8 h-8 text-purple-400" />

                </div>

                <h4 className="text-lg font-semibold text-white mb-2">No recent activity yet</h4>

                <p className="text-slate-400 mb-6">Start exploring to find a swap partner!</p>

                <Link 

                  to="/explore" 

                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all"

                >

                  Explore Experts

                </Link>

              </div>

            )}

          </div>



        </div>

      </div>

    </div>

  );

}

