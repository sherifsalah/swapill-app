import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, BookOpen, Clock, TrendingUp, Settings, ChevronRight, Edit, User, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SKILLS, USERS } from "../data/mockData";
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';
import { useAuth } from '../App';

// Inline SVG Avatars (same as Profile page)
const AVATAR_OPTIONS = [
  {
    id: 'panda',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#ffffff"/>
        <circle cx="35" cy="40" r="8" fill="#000000"/>
        <circle cx="65" cy="40" r="8" fill="#000000"/>
        <circle cx="35" cy="42" r="3" fill="#ffffff"/>
        <circle cx="65" cy="42" r="3" fill="#ffffff"/>
        <ellipse cx="50" cy="65" rx="8" ry="6" fill="#000000"/>
        <circle cx="25" cy="25" r="12" fill="#000000"/>
        <circle cx="75" cy="25" r="12" fill="#000000"/>
        <circle cx="25" cy="27" r="5" fill="#ffffff"/>
        <circle cx="75" cy="27" r="5" fill="#ffffff"/>
      </svg>
    ),
    color: 'from-gray-300 to-gray-500'
  },
  {
    id: 'cat',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#ff8c42"/>
        <polygon points="30,20 35,35 25,35" fill="#ff8c42"/>
        <polygon points="70,20 75,35 65,35" fill="#ff8c42"/>
        <circle cx="35" cy="45" r="5" fill="#000000"/>
        <circle cx="65" cy="45" r="5" fill="#000000"/>
        <circle cx="37" cy="47" r="2" fill="#ffffff"/>
        <circle cx="67" cy="47" r="2" fill="#ffffff"/>
        <polygon points="50,55 45,65 55,65" fill="#ff6b6b"/>
        <line x1="50" y1="65" x2="50" y2="75" stroke="#ff6b6b" strokeWidth="2"/>
      </svg>
    ),
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'robot',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="20" y="30" width="60" height="50" rx="10" fill="#4a90e2"/>
        <rect x="25" y="35" width="20" height="15" rx="5" fill="#ffffff"/>
        <rect x="55" y="35" width="20" height="15" rx="5" fill="#ffffff"/>
        <circle cx="35" cy="42" r="3" fill="#000000"/>
        <circle cx="65" cy="42" r="3" fill="#000000"/>
        <rect x="40" y="60" width="20" height="10" rx="5" fill="#2c5aa0"/>
        <rect x="30" y="75" width="10" height="15" fill="#4a90e2"/>
        <rect x="60" y="75" width="10" height="15" fill="#4a90e2"/>
        <circle cx="35" cy="25" r="5" fill="#ff6b6b"/>
        <circle cx="65" cy="25" r="5" fill="#ff6b6b"/>
      </svg>
    ),
    color: 'from-blue-400 to-cyan-500'
  },
  {
    id: 'rabbit',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="55" r="35" fill="#f5f5dc"/>
        <ellipse cx="35" cy="25" rx="8" ry="20" fill="#f5f5dc"/>
        <ellipse cx="65" cy="25" rx="8" ry="20" fill="#f5f5dc"/>
        <ellipse cx="35" cy="28" rx="4" ry="8" fill="#ffb6c1"/>
        <ellipse cx="65" cy="28" rx="4" ry="8" fill="#ffb6c1"/>
        <circle cx="40" cy="50" r="3" fill="#000000"/>
        <circle cx="60" cy="50" r="3" fill="#000000"/>
        <circle cx="42" cy="51" r="1" fill="#ffffff"/>
        <circle cx="62" cy="51" r="1" fill="#ffffff"/>
        <circle cx="50" cy="60" r="2" fill="#ffb6c1"/>
        <circle cx="45" cy="65" r="1" fill="#000000"/>
        <circle cx="55" cy="65" r="1" fill="#000000"/>
      </svg>
    ),
    color: 'from-pink-300 to-purple-400'
  },
  {
    id: 'girl',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#fdbcb4"/>
        <path d="M 20 40 Q 50 20 80 40 Q 80 50 50 60 Q 20 50 20 40" fill="#8b4513"/>
        <circle cx="35" cy="45" r="3" fill="#000000"/>
        <circle cx="65" cy="45" r="3" fill="#000000"/>
        <circle cx="37" cy="46" r="1" fill="#ffffff"/>
        <circle cx="67" cy="46" r="1" fill="#ffffff"/>
        <path d="M 50 55 Q 45 60 40 55" fill="#ff69b4"/>
        <path d="M 50 55 Q 55 60 60 55" fill="#ff69b4"/>
        <circle cx="50" cy="65" r="2" fill="#ff69b4"/>
      </svg>
    ),
    color: 'from-purple-400 to-pink-500'
  },
  {
    id: 'boy',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#fdbcb4"/>
        <path d="M 25 35 Q 50 25 75 35 Q 75 45 50 50 Q 25 45 25 35" fill="#4a4a4a"/>
        <circle cx="35" cy="45" r="3" fill="#000000"/>
        <circle cx="65" cy="45" r="3" fill="#000000"/>
        <circle cx="37" cy="46" r="1" fill="#ffffff"/>
        <circle cx="67" cy="46" r="1" fill="#ffffff"/>
        <rect x="45" y="55" width="10" height="8" rx="4" fill="#4a4a4a"/>
        <circle cx="50" cy="65" r="2" fill="#ff69b4"/>
      </svg>
    ),
    color: 'from-blue-400 to-indigo-500'
  },
  {
    id: 'artist',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#ffe4b5"/>
        <path d="M 30 40 Q 50 30 70 40 Q 70 50 50 55 Q 30 50 30 40" fill="#ff69b4"/>
        <circle cx="35" cy="45" r="3" fill="#000000"/>
        <circle cx="65" cy="45" r="3" fill="#000000"/>
        <circle cx="37" cy="46" r="1" fill="#ffffff"/>
        <circle cx="67" cy="46" r="1" fill="#ffffff"/>
        <path d="M 50 55 Q 45 58 40 55" fill="#ff69b4"/>
        <path d="M 50 55 Q 55 58 60 55" fill="#ff69b4"/>
        <circle cx="50" cy="63" r="2" fill="#ff69b4"/>
        <circle cx="25" cy="25" r="3" fill="#ffd700"/>
      </svg>
    ),
    color: 'from-yellow-400 to-orange-500'
  },
  {
    id: 'scientist',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="45" fill="#e6e6fa"/>
        <circle cx="50" cy="35" r="20" fill="#4169e1"/>
        <rect x="30" y="30" width="40" height="10" fill="#4169e1"/>
        <circle cx="35" cy="45" r="3" fill="#000000"/>
        <circle cx="65" cy="45" r="3" fill="#000000"/>
        <circle cx="37" cy="46" r="1" fill="#ffffff"/>
        <circle cx="67" cy="46" r="1" fill="#ffffff"/>
        <rect x="45" y="55" width="10" height="8" rx="4" fill="#4169e1"/>
        <circle cx="50" cy="65" r="2" fill="#ff69b4"/>
      </svg>
    ),
    color: 'from-indigo-400 to-purple-500'
  }
];

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  joinDate: string;
  avatar?: string;
  avatarSvg?: React.ReactNode;
  avatarPreview?: string;
  skills: any[];
  endorsements: number;
  exchanges: number;
  trustScore: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simplified: only depend on authLoading and user
    if (authLoading) {
      return;
    }

    // If no user, ProtectedRoute will handle redirect
    if (!user) {
      setLoading(false);
      return;
    }

    // Set loading to false immediately when user exists
    setLoading(false);

    const fetchProfileData = async () => {
      try {
        console.log('User authenticated, fetching profile data for:', user.email);
        
        // Set default currentUser immediately using user.id and user.email
        const defaultUser: UserProfile = {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          bio: user.user_metadata?.bio || '',
          location: user.user_metadata?.country || 'Location not set',
          joinDate: user.created_at || new Date().toISOString(),
          skills: [],
          endorsements: 0,
          exchanges: 0,
          trustScore: 0,
        };
        setCurrentUser(defaultUser);
        
        // Fetch user skills from Supabase
        console.log('Fetching skills from Supabase...');
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (skillsError) {
          console.log('Skills fetch failed, continuing with empty skills:', skillsError.message);
        }

        // Update default user with skills if fetched
        if (skillsData && skillsData.length > 0) {
          setCurrentUser(prev => prev ? { ...prev, skills: skillsData } : defaultUser);
        }

        // Fetch user profile data from profiles table (non-blocking)
        console.log('Fetching profile data from Supabase...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileError) {
          console.warn('Profile fetch failed, using default user:', profileError.message);
          // DO NOT stop execution - continue with default user
          return;
        }
        
        if (profileData) {
          console.log('Profile data fetched successfully:', profileData);
          
          // Transform profile data to match UserProfile interface
          
          // Process avatar data
          let avatar: string | undefined;
          let avatarSvg: React.ReactNode | undefined;
          let avatarPreview: string | undefined;
          
          if (profileData.avatar_url) {
            if (profileData.avatar_url.startsWith('avatar:')) {
              // It's a selected avatar
              const avatarId = profileData.avatar_url.replace('avatar:', '');
              avatar = avatarId;
              avatarSvg = AVATAR_OPTIONS.find(opt => opt.id === avatarId)?.svg;
            } else {
              // It's an uploaded image URL
              avatar = 'uploaded';
              avatarPreview = profileData.avatar_url;
            }
          }
          
          const userProfile: UserProfile = {
            name: profileData.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            bio: profileData.bio || user.user_metadata?.bio || '',
            location: user.user_metadata?.country || 'Location not set',
            joinDate: profileData.created_at || user.created_at || new Date().toISOString(),
            skills: profileData.skills_offered || skillsData || [],
            avatar: avatar,
            avatarSvg: avatarSvg,
            avatarPreview: avatarPreview,
            endorsements: 0,
            exchanges: 0,
            trustScore: 0,
          };
          
          setCurrentUser(userProfile);
        }
      } catch (error) {
        console.warn('Unexpected error fetching profile:', error.message);
        // Continue with default user - no interruption
      }
    };
    
    fetchProfileData();
  }, [authLoading, user]); // Simplified dependencies

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
      const updatedUser = {
        ...currentUser,
        skills: refreshedSkills || []
      };
      setCurrentUser(updatedUser);
      
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
    
    if (currentUser.avatarPreview) {
      return (
        <img 
          src={currentUser.avatarPreview} 
          alt={currentUser.name} 
          className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl"
        />
      );
    }
    
    if (currentUser.avatarSvg) {
      return (
        <div className="w-24 h-24 rounded-full bg-white/10 ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl flex items-center justify-center overflow-hidden mx-auto">
          {currentUser.avatarSvg}
        </div>
      );
    }
    
    if (currentUser.avatar) {
      const avatarOption = AVATAR_OPTIONS.find(opt => opt.id === currentUser.avatar);
      return (
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatarOption?.color || 'from-purple-500 to-violet-600'} ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl flex items-center justify-center mx-auto`}>
          <span className="text-white text-2xl font-bold">
            {currentUser.name.charAt(0).toUpperCase()}
          </span>
        </div>
      );
    }
    
    // Default initials circle
    return (
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 ring-4 ring-purple-500/20 p-1 bg-slate-900 shadow-xl flex items-center justify-center mx-auto">
        <span className="text-white text-2xl font-bold">
          {currentUser.name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  };

  if (loading || authLoading) {
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
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar info */}
        <aside className="lg:w-80 shrink-0">
          <div className="glass-card p-8 text-center mb-8">
            <div className="relative inline-block mb-6">
              {getAvatarDisplay()}
              <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#1e293b] rounded-full" />
            </div>
            <h2 className="text-xl font-bold mb-1">{currentUser.name}</h2>
            <p className="text-slate-400 text-sm mb-6">
              {currentUser.skills.length > 0 ? currentUser.skills[0].title : 'No skill selected'} • {currentUser.location}
            </p>
            
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
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
