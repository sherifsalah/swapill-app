import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../App';

export interface UserProfile {
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

interface UserProfileContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: ReactNode;
}

export function UserProfileProvider({ children }: UserProfileProviderProps) {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async () => {
    if (!user) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('=== PROFILE FETCH DEBUG ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);
      
      // Fetch complete user profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('Profile fetch result:', { profileData, profileError });

      // Fetch user skills from skills table
      const { data: skillsData, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('Skills fetch result:', { skillsData, skillsError });

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('=== PROFILE FETCH ERROR ===');
        console.error('Full error object:', profileError);
        console.error('Error message:', profileError.message);
        console.error('Error details:', profileError.details);
        console.error('Error code:', profileError.code);
      }

      if (skillsError && skillsError.code !== 'PGRST116') {
        console.error('=== SKILLS FETCH ERROR ===');
        console.error('Full error object:', skillsError);
        console.error('Error message:', skillsError.message);
        console.error('Error details:', skillsError.details);
        console.error('Error code:', skillsError.code);
      }

      // Create profile data from database or fallback to user metadata
      const userProfile: UserProfile = {
        name: profileData?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        bio: profileData?.bio !== undefined ? profileData.bio : (user.user_metadata?.bio || ''),
        location: user.user_metadata?.country || 'Location not set',
        joinDate: profileData?.created_at || user.created_at || new Date().toISOString(),
        skills: skillsData || [],
        avatar_url: profileData?.avatar_url !== undefined ? profileData.avatar_url : user.user_metadata?.avatar_url,
        endorsements: 0,
        exchanges: 0,
        trustScore: 0,
      };
      
      console.log('=== SETTING USER PROFILE ===');
      console.log('Final user profile data:', userProfile);
      console.log('Bio from database:', profileData?.bio);
      console.log('Avatar URL from database:', profileData?.avatar_url);
      
      setCurrentUser(userProfile);
      
      // Also update localStorage for backward compatibility
      localStorage.setItem('swapill_user', JSON.stringify(userProfile));
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic user data
      const fallbackProfile: UserProfile = {
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        bio: user.user_metadata?.bio || '',
        location: user.user_metadata?.country || 'Location not set',
        joinDate: user.created_at || new Date().toISOString(),
        skills: [],
        avatar_url: user.user_metadata?.avatar_url,
        endorsements: 0,
        exchanges: 0,
        trustScore: 0,
      };
      setCurrentUser(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
      localStorage.setItem('swapill_user', JSON.stringify(updatedUser));
    }
  };

  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const value: UserProfileContextType = {
    currentUser,
    loading,
    updateProfile,
    refreshProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}
