import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../App';

interface UserProfile {
  id: string;
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
  updated_at?: string;
}

interface UserProfileContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  friends: string[];
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshProfile: () => Promise<void>;
  refreshFriends: () => Promise<void>;
  setCurrentUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
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

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<string[]>([]);

  const refreshProfile = async () => {
    if (!user?.id) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, skills!skills_user_id_fkey(*)')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create a basic one
        if (error.code === 'PGRST116') {
          const basicProfile: UserProfile = {
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            bio: 'New member on Swapill',
            location: 'Location not set',
            joinDate: user.created_at || new Date().toISOString(),
            avatar_url: user.user_metadata?.avatar_url || null,
            skills: [],
            endorsements: 0,
            exchanges: 0,
            trustScore: 0
          };
          
          // Create profile in database
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              name: basicProfile.name,
              email: basicProfile.email,
              bio: basicProfile.bio,
              location: basicProfile.location,
              avatar_url: basicProfile.avatar_url,
              created_at: basicProfile.joinDate
            }]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            setCurrentUser(basicProfile);
          }
        }
      } else {
        // Transform profile data to match UserProfile interface
        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name || user.email?.split('@')[0] || 'User',
          email: profile.email || user.email || '',
          bio: profile.bio || '',
          location: profile.location || '',
          joinDate: profile.created_at || user.created_at || new Date().toISOString(),
          avatar_url: profile.avatar_url,
          skills: profile.skills || [],
          endorsements: profile.endorsements || 0,
          exchanges: profile.exchanges || 0,
          trustScore: profile.trust_score || 0,
          updated_at: profile.updated_at
        };
        
        setCurrentUser(userProfile);
      }
    } catch (error) {
      console.error('Error in refreshProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...updates });
    }
  };

  const refreshFriends = async () => {
    if (!user?.id) {
      setFriends([]);
      return;
    }

    try {
      console.log('Fetching friends for user:', user.id);
      
      // Fetch accepted swap requests where current user is either sender or receiver
      const { data: acceptedRequests, error } = await supabase
        .from('swap_requests')
        .select('sender_id, receiver_id')
        .eq('status', 'accepted')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching friends:', error);
        setFriends([]);
        return;
      }

      // Extract friend IDs (exclude current user)
      const friendIds = new Set<string>();
      acceptedRequests?.forEach(request => {
        if (request.sender_id !== user.id) {
          friendIds.add(request.sender_id);
        }
        if (request.receiver_id !== user.id) {
          friendIds.add(request.receiver_id);
        }
      });

      const friendsArray = Array.from(friendIds);
      console.log('Friends found:', friendsArray);
      setFriends(friendsArray);
    } catch (error) {
      console.error('Error in refreshFriends:', error);
      setFriends([]);
    }
  };

  useEffect(() => {
    if (user) {
      refreshProfile();
      refreshFriends();
    } else {
      setCurrentUser(null);
      setFriends([]);
      setLoading(false);
    }
  }, [user?.id]);

  const value: UserProfileContextType = {
    currentUser,
    loading,
    friends,
    updateProfile,
    refreshProfile,
    refreshFriends,
    setCurrentUser,
    setLoading
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
