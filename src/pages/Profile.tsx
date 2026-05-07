import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { User, Edit, Plus, Upload, MapPin, Calendar, Mail, Share2, MessageSquare, ShieldCheck, Star, MessageCircle, Camera, Code, Smartphone, Palette, TrendingUp, Globe, PenTool, Music, ChefHat, Sparkles, Brain, Mic, Users, Kanban, Clipboard, Trash2, ChevronDown } from 'lucide-react';
import { USERS, SKILLS } from "../data/mockData";
import SkillCard from "../components/shared/SkillCard";
import { AnimatePresence } from "motion/react";
import toast from 'react-hot-toast';
import { useAuth } from "../App";
import { supabase } from "../config/supabase";

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  joinDate: string;
  avatar_url?: string; // Use 'avatar_url' instead of 'imageUrl'
  skills: any[];
  endorsements: number;
  exchanges: number;
  trustScore: number;
}

// Skill Categories with icons
const SKILL_CATEGORIES = [
  { id: 'web', name: 'Web Development', icon: Code },
  { id: 'mobile', name: 'Mobile Development', icon: Smartphone },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'languages', name: 'Languages', icon: Globe },
  { id: 'writing', name: 'Writing Skills', icon: PenTool },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'cooking', name: 'Cooking', icon: ChefHat },
  { id: 'prompt', name: 'Prompt Engineering', icon: Sparkles },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'speaking', name: 'Public Speaking', icon: Mic },
  { id: 'management', name: 'Project Management', icon: Kanban },
];


export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [skillLoading, setSkillLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    location: ''
  });
  const [skillForm, setSkillForm] = useState({
    title: '',
    description: '',
    category: 'web'
  });
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Wait for auth state to be loaded
    if (loading) {
      return;
    }

    // If no user, ProtectedRoute will handle redirect
    if (!user) {
      return;
    }

    // Fetch user profile and skills from Supabase
    const fetchUserData = async () => {
      try {
        setProfileLoading(true);
        
        // Fetch user skills from Supabase
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (skillsError) {
          console.error('Error fetching skills:', skillsError);
          // Continue with empty skills array if fetch fails
        }

        // Fetch user profile from Supabase using 'user_id' column
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id) // Use 'user_id' as primary column
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('Error fetching profile:', profileError);
        }

        // Create profile data from authenticated user and database
        const userProfile: UserProfile = {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          bio: profileData?.bio || user.user_metadata?.bio || '',
          location: user.user_metadata?.country || 'Location not set',
          joinDate: user.created_at || new Date().toISOString(),
          skills: skillsData || [],
          avatar_url: profileData?.avatar_url, // Use 'avatar_url' column
          // Zero out stats for new users
          endorsements: 0,
          exchanges: 0,
          trustScore: 0,
        };
        
        setCurrentUser(userProfile);
        setEditForm({
          bio: userProfile.bio,
          location: userProfile.location
        });
        
      } catch (error) {
        console.error('Error in fetchUserData:', error);
        // Fallback to empty skills array
        const fallbackProfile: UserProfile = {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          bio: user.user_metadata?.bio || '',
          location: user.user_metadata?.country || 'Location not set',
          joinDate: user.created_at || new Date().toISOString(),
          skills: [],
          avatar_url: undefined, // Use 'avatar_url' column
          endorsements: 0,
          exchanges: 0,
          trustScore: 0,
        };
        
        setCurrentUser(fallbackProfile);
        setEditForm({
          bio: fallbackProfile.bio,
          location: fallbackProfile.location
        });
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserData();
  }, [user, loading]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSkillsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setPhotoLoading(true);
      
      try {
        // Get current user to verify ID
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting current user:', userError);
          toast.error('Authentication error. Please try again.');
          return;
        }
        
        console.log('=== ADD PHOTO USER VERIFICATION ===');
        console.log('Auth User ID:', authUser?.id);
        console.log('Context User ID:', user.id);
        console.log('IDs match:', user.id === authUser?.id);
        
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${authUser?.id}_${Date.now()}.${fileExt}`;
        const filePath = `profile-images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('Swapill')
          .upload(filePath, file, {
            upsert: true
          });

        if (uploadError) {
          console.error('=== UPLOAD ERROR ===');
          console.error('Full error object:', uploadError);
          console.error('Error message:', uploadError.message);
          toast.error('Failed to upload photo');
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('Swapill')
          .getPublicUrl(filePath);

        console.log('=== UPLOAD SUCCESS ===');
        console.log('File path:', filePath);
        console.log('Public URL:', publicUrl);

        // Combined update: profile with new avatar URL as string
        await updateProfileData({
          avatar_url: publicUrl, // Save as string URL, not object
          bio: currentUser?.bio,
          skills: currentUser?.skills || []
        }, authUser?.id);
        
      } catch (error) {
        console.error('=== CATCH BLOCK ERROR ===');
        console.error('Full error object:', error);
        console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
        toast.error('An error occurred while uploading photo');
      } finally {
        setPhotoLoading(false);
      }
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    
    setPhotoLoading(true);
    
    try {
      // Get current user to verify ID
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting current user:', userError);
          toast.error('Authentication error. Please try again.');
          return;
        }
        
        console.log('=== REMOVE PHOTO USER VERIFICATION ===');
        console.log('Auth User ID:', authUser?.id);
        console.log('Context User ID:', user.id);
        console.log('IDs match:', user.id === authUser?.id);
      
      // Combined update: remove avatar URL as null string
      await updateProfileData({
        avatar_url: null, // Save as null string URL
        bio: currentUser?.bio,
        skills: currentUser?.skills || []
      }, authUser?.id);
      
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('An error occurred while removing photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const updateProfileData = async (data: {
    avatar_url?: string | null; // Use 'avatar_url' instead of 'image_url'
    bio?: string;
    skills?: any[];
  }, userId?: string) => {
    try {
      console.log('=== UPSERT PROFILE DATA ===');
      console.log('User ID:', userId);
      console.log('Update data:', data);
      
      // Get current user if userId not provided
      const targetUserId = userId || user.id;
      
      // Prepare upsert object
      const upsertObj: any = {
        user_id: targetUserId, // Required for upsert
        full_name: user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
        updated_at: new Date().toISOString()
      };
      
      if (data.avatar_url !== undefined) {
        upsertObj.avatar_url = data.avatar_url; // Use 'avatar_url' column
      }
      
      if (data.bio !== undefined) {
        upsertObj.bio = data.bio;
      }
      
      // Note: skills are handled separately in the skills table
      
      console.log('Final upsert object:', upsertObj);
      
      // Upsert profile in Supabase using 'user_id' column
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(upsertObj, {
          onConflict: 'user_id' // Conflict on user_id column
        });

      if (upsertError) {
        console.error('=== PROFILE UPSERT ERROR ===');
        console.error('Full error object:', upsertError);
        console.error('Error message:', upsertError.message);
        toast.error(`Failed to save profile: ${upsertError.message}`);
        return;
      }

      console.log('=== PROFILE UPSERT SUCCESS ===');
      
      // Sync skills if provided
      if (data.skills !== undefined) {
        console.log('Syncing skills:', data.skills);
        const skillsResult = await syncSkillsToProfile(data.skills, targetUserId);
        if (skillsResult.error) {
          console.error('Skills sync failed:', skillsResult.error);
          toast.error(`Failed to update skills: ${skillsResult.error}`);
          // Don't return here, continue with profile update
        } else {
          console.log('Skills synced successfully');
        }
      }
      
      // Update user metadata for bio
      if (data.bio !== undefined) {
        const { error: metadataError } = await supabase.auth.updateUser({
          data: {
            bio: data.bio
          }
        });

        if (metadataError) {
          console.error('Error updating user metadata:', metadataError);
        }
      }

      // Update local state
      if (currentUser) {
        const updatedUser = { 
          ...currentUser,
          ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }), // Use 'avatar_url'
          ...(data.bio !== undefined && { bio: data.bio })
        };
        setCurrentUser(updatedUser);
      }
      
      // Determine success message
      let successMessage = 'Profile updated successfully!';
      if (data.avatar_url !== undefined) {
        successMessage = data.avatar_url ? 'Profile photo updated successfully!' : 'Photo removed successfully!';
      }
      if (data.bio !== undefined && data.avatar_url === undefined) {
        successMessage = 'Bio updated successfully!';
      }
      if (data.skills !== undefined && data.avatar_url === undefined && data.bio === undefined) {
        successMessage = 'Skills updated successfully!';
      }
      
      console.log('=== PROFILE SAVE SUCCESS ===');
      console.log('Success message:', successMessage);
      toast.success(successMessage);
      
    } catch (error) {
      console.error('=== UPDATE PROFILE CATCH ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('An error occurred while updating profile');
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser || !user) return;
    
    setUpdateLoading(true);
    
    try {
      console.log('=== SAVE PROFILE START ===');
      
      // Get current user to verify ID
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Error getting current user:', userError);
          toast.error('Authentication error. Please try again.');
          return;
        }
        
        console.log('=== SAVE PROFILE USER VERIFICATION ===');
        console.log('Auth User ID:', authUser?.id);
        console.log('Context User ID:', user.id);
        console.log('IDs match:', user.id === authUser?.id);
      
      // Combined update: bio and current avatar/skills
      await updateProfileData({
        bio: editForm.bio,
        avatar_url: currentUser?.avatar_url, // Use 'avatar_url' column
        skills: currentUser?.skills || []
      }, authUser?.id);
      
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Error in handleSaveProfile:', error);
      toast.error('An error occurred while updating profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddSkill = () => {
    setShowSkillModal(true);
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      console.log('Deleting skill:', skillId);
      
      // Get current user to verify ID
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting current user:', userError);
        toast.error('Authentication error. Please try again.');
        return;
      }
      
      console.log('=== DELETE SKILL USER VERIFICATION ===');
      console.log('Auth User ID:', authUser?.id);
      console.log('Context User ID:', user.id);
      console.log('IDs match:', user.id === authUser?.id);
      
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', skillId)
        .eq('user_id', authUser?.id); // Keep user_id for skills table

      if (error) {
        console.error('Error deleting skill:', error);
        toast.error('Failed to delete skill');
        return;
      }

      toast.success('Skill deleted successfully!');
      setShowSkillsDropdown(false);
      
      // Refresh skills from database
      const { data: refreshedSkills, error: refreshError } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', authUser?.id) // Keep user_id for skills table
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

  const handleEditSkillFromDropdown = (skill: any) => {
    setEditingSkill(skill);
    setSkillForm({
      title: skill.title,
      description: skill.description,
      category: skill.category
    });
    setShowSkillsDropdown(false);
    setShowSkillModal(true);
  };

  const syncSkillsToProfile = async (skills: any[], userId: string) => {
    try {
      console.log('=== SYNC SKILLS TO PROFILE ===');
      console.log('User ID:', userId);
      console.log('Skills to sync:', skills);
      
      // Get current authenticated user
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error getting auth user:', authError);
        return { error: 'Authentication error' };
      }
      
      // Use auth.uid() directly for skills table
      const authUid = authUser?.id;
      console.log('Auth UID:', authUid);
      
      // Delete existing skills for this user using auth.uid()
      const { error: deleteError } = await supabase
        .from('skills')
        .delete()
        .eq('user_id', authUid);
        
      if (deleteError) {
        console.error('=== DELETE SKILLS ERROR ===');
        console.error('Full error object:', deleteError);
        console.error('Error message:', deleteError.message);
        console.error('Error code:', deleteError.code);
        return { error: `Failed to delete skills: ${deleteError.message}` };
      }
      
      console.log('Existing skills deleted successfully');
      
      // Insert new skills if any
      if (skills.length > 0) {
        const skillsToInsert = skills.map(skill => ({
          user_id: authUid, // Use auth.uid() directly
          title: skill.title || skill,
          category: skill.category || 'web',
          description: skill.description || "", // Send empty string instead of null
          created_at: new Date().toISOString()
        }));
        
        console.log('Skills to insert:', skillsToInsert);
        
        const { data: insertData, error: insertError } = await supabase
          .from('skills')
          .insert(skillsToInsert)
          .select();
          
        if (insertError) {
          console.error('=== INSERT SKILLS ERROR ===');
          console.error('Full error object:', insertError);
          console.error('Error message:', insertError.message);
          console.error('Error code:', insertError.code);
          console.error('Error details:', insertError.details);
          return { error: `Failed to save skills: ${insertError.message}` };
        }
        
        console.log('Skills inserted successfully:', insertData);
        return { data: insertData };
      }
      
      console.log('Skills sync completed (no skills to add)');
      return { data: [] };
      
    } catch (error) {
      console.error('=== CATCH ERROR IN SYNC SKILLS ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      return { error: 'Failed to sync skills' };
    }
  };

const handleSaveSkill = async () => {
    if (!skillForm.title.trim() || !user) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSkillLoading(true);
    
    try {
      console.log('=== ADD SKILL DEBUG ===');
      console.log('User ID:', user.id);
      console.log('User Email:', user.email);
      
      // Get current authenticated user
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting current user:', userError);
        toast.error('Authentication error. Please try again.');
        return;
      }
      
      console.log('Current User ID from getUser():', authUser?.id);
      console.log('User ID matches:', user.id === authUser?.id);
      
      // Prepare skill data using auth.uid() directly
      const skillData = {
        user_id: authUser?.id, // Use auth.uid() directly
        title: skillForm.title.trim(),
        category: skillForm.category,
        description: skillForm.description || "", // Send empty string instead of null
        created_at: new Date().toISOString()
      };
      
      console.log('Skill data to insert:', skillData);
      console.log('Required fields check:');
      console.log('- user_id:', skillData.user_id ? '✓' : '✗');
      console.log('- title:', skillData.title ? '✓' : '✗');
      console.log('- category:', skillData.category ? '✓' : '✗');
      
      // Insert skill into skills table
      const { data: insertData, error: insertError } = await supabase
        .from('skills')
        .insert([skillData])
        .select();

      if (insertError) {
        console.error('=== SUPABASE INSERT ERROR ===');
        console.error('Full error object:', insertError);
        console.error('Error message:', insertError.message);
        console.error('Error details:', insertError.details);
        console.error('Error code:', insertError.code);
        console.error('Error hint:', insertError.hint);
        
        // Check if it's a permission error
        if (insertError.code === '42501' || insertError.message?.includes('permission denied')) {
          toast.error('Permission denied. Check RLS policies.');
        } else {
          toast.error(`Failed to save skill: ${insertError.message}`);
        }
        return;
      }

      console.log('=== SKILL SAVE SUCCESS ===');
      console.log('Skill saved successfully:', insertData);
      
      // Update local state with new skill
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          skills: [...(currentUser.skills || []), insertData[0]]
        };
        setCurrentUser(updatedUser);
        localStorage.setItem('swapill_user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('swapill_user') || '{}'),
          skills: updatedUser.skills
        }));
      }
      
      toast.success('Skill added successfully!');
      setSkillForm({ title: '', description: '', category: 'web' });
      setShowSkillModal(false);
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An error occurred while saving the skill');
    } finally {
      setSkillLoading(false);
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill || !user) return;
    
    if (!skillForm.title.trim() || !skillForm.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSkillLoading(true);
    
    try {
      console.log('=== UPDATE SKILL DEBUG ===');
      console.log('Skill ID:', editingSkill.id);
      console.log('User ID:', user.id);
      
      // Get current user to verify ID
      const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Error getting current user:', userError);
        toast.error('Authentication error. Please try again.');
        return;
      }
      
      console.log('=== UPDATE SKILL USER VERIFICATION ===');
      console.log('Auth User ID:', authUser?.id);
      console.log('Context User ID:', user.id);
      console.log('IDs match:', user.id === authUser?.id);
      
      const updateData = {
        title: skillForm.title.trim(),
        description: skillForm.description.trim(),
        category: skillForm.category,
        updated_at: new Date().toISOString()
      };
      
      console.log('Skill data to update:', updateData);
      
      // Update skill in Supabase
      const { data: updateDataResult, error } = await supabase
        .from('skills')
        .update(updateData)
        .eq('id', editingSkill.id)
        .eq('user_id', authUser?.id); // Keep user_id for skills table

      if (error) {
        console.error('=== SUPABASE ERROR ===');
        console.error('Full error object:', error);
        console.error('Error message:', error.message);
        toast.error(`Failed to update skill: ${error.message}`);
        return;
      }

      console.log('=== SUCCESS ===');
      console.log('Skill updated successfully:', updateDataResult);
      
      // Re-fetch skills from Supabase to ensure UI is in sync with database
      const { data: refreshedSkills, error: refreshError } = await supabase
        .from('skills')
        .select('*')
        .eq('user_id', authUser?.id) // Keep user_id for skills table
        .order('created_at', { ascending: false });

      if (refreshError) {
        console.error('Error refreshing skills:', refreshError);
        toast.error('Skill updated but failed to refresh list');
      } else {
        // Update user state with refreshed skills
        const updatedUser = {
          ...currentUser,
          skills: refreshedSkills || []
        };
        setCurrentUser(updatedUser);
        console.log('Skills refreshed from database:', refreshedSkills);
      }
      
      toast.success('Skill updated successfully!');
      setShowSkillModal(false);
      setSkillForm({ title: '', description: '', category: 'web' });
      setEditingSkill(null);
      
    } catch (error) {
      console.error('=== CATCH BLOCK ERROR ===');
      console.error('Full error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setSkillLoading(false);
    }
  };

  // Show loading state while auth is loading
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading profile...</div>
        </div>
      </div>
    );
  }

  // If no user after loading, ProtectedRoute will handle redirect
  if (!currentUser) {
    return null;
  }

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6">
      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAddPhoto}
        className="hidden"
      />
      
      {/* Header / Banner area */}
      <div className="relative h-64 rounded-3xl overflow-visible mb-24">
         <div className="absolute inset-0 bg-gradient-to-r from-purple-800 via-slate-900 to-blue-900 animate-gradient-x" />
         <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
         
         {/* Glassmorphism effect on bottom edge */}
         <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-900/50 to-transparent backdrop-blur-sm" />
         
         {/* Edit Banner Icon */}
         <button className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all z-10">
            <Edit className="w-4 h-4 text-white" />
         </button>
         
         {/* Profile Image Container - Absolutely Positioned with High Z-Index */}
         <div className="absolute bottom-[-60px] left-12 z-50">
            <div className="relative">
               {/* Profile Picture Area */}
               <div className="relative group">
                 {currentUser.avatar_url ? (
                   <div className="relative">
                     <img 
                       src={currentUser.avatar_url} 
                       alt={currentUser.name} 
                       className="w-[140px] h-[140px] rounded-full object-cover border-4 border-slate-950 shadow-2xl transition-all duration-300 group-hover:brightness-90"
                     />
                     {/* Hover overlay with remove option */}
                     <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                       <button
                         onClick={handleRemovePhoto}
                         disabled={photoLoading}
                         className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all disabled:opacity-50"
                         title="Remove photo"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <div className="relative">
                     <button
                       onClick={() => fileInputRef.current?.click()}
                       disabled={photoLoading}
                       className="w-[140px] h-[140px] rounded-full bg-white/10 border-4 border-dashed border-white/30 flex items-center justify-center hover:bg-white/20 transition-all group cursor-pointer disabled:opacity-50"
                     >
                       {photoLoading ? (
                         <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       ) : (
                         <Plus className="w-10 h-10 text-white/60 group-hover:text-white" />
                       )}
                     </button>
                     {/* Hover overlay */}
                     <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                       <Camera className="w-8 h-8 text-white" />
                     </div>
                   </div>
                 )}
                 
                 {/* Add Photo Button (only show when no photo) */}
                 {!currentUser.avatar_url && (
                   <button
                     onClick={() => fileInputRef.current?.click()}
                     disabled={photoLoading}
                     className="absolute bottom-2 right-2 w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full border-2 border-slate-950 shadow-lg flex items-center justify-center hover:from-purple-400 hover:to-violet-500 transition-all duration-300 disabled:opacity-50 group-hover:scale-110"
                     title="Add photo"
                   >
                     {photoLoading ? (
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                     ) : (
                       <Plus className="w-4 h-4 text-white" />
                     )}
                   </button>
                 )}
               </div>
               <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-slate-950 rounded-full" />
            </div>
         </div>
      </div>
      
      {/* Profile Info Section - Below Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-24">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
            <div className="text-center md:text-left flex-1">
               <h1 className="text-4xl md:text-5xl font-bold flex items-center justify-center md:justify-start gap-3 mb-3">
                  {currentUser.name}
                  <ShieldCheck className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
               </h1>
               <p className="text-slate-300 font-medium text-lg mb-4">Expertise Swapper</p>
               <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                     <MapPin className="w-4 h-4" />
                     {currentUser.location || 'Add your location'}
                  </div>
                  <div className="flex items-center gap-2">
                     <Calendar className="w-4 h-4" />
                     Joined {formatDate(currentUser.joinDate)}
                  </div>
               </div>
            </div>
            
            <div className="flex gap-3">
               <button className="btn-secondary p-3 rounded-2xl">
                  <Share2 className="w-5 h-5" />
               </button>
               <button 
                  onClick={() => navigate('/explore')}
                  className="btn-primary px-6 md:px-8 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Start Exchange
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-32">
        {/* Left Column: About */}
        <div className="space-y-8">
           <section className="glass-card p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">About Me</h3>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <p className="text-slate-400 leading-relaxed mb-8 min-h-[60px]">
                {currentUser.bio || 'Tell others about yourself and what skills you can share...'}
              </p>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {currentUser.location || 'Add your location'}
                 </div>
                 <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    Joined {formatDate(currentUser.joinDate)}
                 </div>
                 <div className="flex items-center gap-3 text-slate-300 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    {currentUser.email || 'No email'}
                 </div>
              </div>
           </section>

           <section className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6">Statistics</h3>
              <div className="space-y-6">
                 {/* Trust Score - Hidden for new users */}
                 {currentUser.trustScore > 0 && (
                   <div>
                      <div className="flex justify-between text-sm mb-2">
                         <span className="text-slate-400">Trust Score</span>
                         <span className="text-green-400 font-bold">{currentUser.trustScore}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500" style={{ width: `${currentUser.trustScore}%` }} />
                      </div>
                   </div>
                 )}
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 text-center">
                       <div className="text-2xl font-bold">{currentUser.endorsements}</div>
                       <div className="text-[10px] uppercase font-black text-slate-500">Endorsements</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 text-center">
                       <div className="text-2xl font-bold">{currentUser.exchanges}</div>
                       <div className="text-[10px] uppercase font-black text-slate-500">Exchanges</div>
                    </div>
                 </div>
              </div>
           </section>
        </div>

        {/* Right Column: Skills & Reviews */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Active Offerings</h2>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                  className="text-slate-500 text-sm font-medium hover:text-purple-400 hover:underline cursor-pointer transition-all flex items-center gap-1"
                >
                  {currentUser.skills.length} Skills Available
                  <ChevronDown className={`w-3 h-3 transition-transform ${showSkillsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showSkillsDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto"
                    >
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-white mb-3">My Skills</h4>
                        {currentUser.skills.length > 0 ? (
                          <div className="space-y-2">
                            {currentUser.skills.map((skill) => (
                              <div key={skill.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                                <div className="flex-1">
                                  <div className="font-medium text-white text-sm">{skill.title}</div>
                                  <div className="text-xs text-slate-500 uppercase tracking-wider">{skill.category}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditSkillFromDropdown(skill)}
                                    className="text-slate-400 hover:text-white transition-colors p-1"
                                    title="Edit skill"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSkill(skill.id)}
                                    className="text-slate-400 hover:text-red-400 transition-colors p-1"
                                    title="Delete skill"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-slate-400 text-sm">No skills added yet</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Skills Grid with Categories */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {SKILL_CATEGORIES.map((category, index) => {
                const hasSkills = currentUser.skills.some(skill => skill.category === category.id);
                const categorySkills = currentUser.skills.filter(skill => skill.category === category.id);
                
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative group ${!hasSkills ? 'opacity-60' : ''}`}
                  >
                    <div className="glass-card p-6 h-full min-h-[180px] flex flex-col justify-between hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105">
                      {/* Category Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center group-hover:from-purple-500/30 group-hover:to-violet-500/30 transition-all duration-300">
                          <category.icon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
                        </div>
                        {!hasSkills && (
                          <button
                            onClick={() => {
                              setSkillForm(prev => ({ ...prev, category: category.id }));
                              setShowSkillModal(true);
                            }}
                            className="w-8 h-8 rounded-full bg-purple-500/20 hover:bg-purple-500/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                          >
                            <Plus className="w-4 h-4 text-purple-400" />
                          </button>
                        )}
                      </div>
                      
                      {/* Category Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                        {hasSkills ? (
                          <div className="space-y-2">
                            {categorySkills.slice(0, 2).map((skill, skillIndex) => (
                              <div key={skillIndex} className="text-sm text-slate-300">
                                • {skill.title}
                              </div>
                            ))}
                            {categorySkills.length > 2 && (
                              <div className="text-xs text-purple-400 font-medium">
                                +{categorySkills.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 italic">
                            No skills added yet
                          </p>
                        )}
                      </div>
                      
                      {/* Category Footer */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <span className="text-xs text-slate-500">
                          {hasSkills ? `${categorySkills.length} skill${categorySkills.length > 1 ? 's' : ''}` : 'Add skills'}
                        </span>
                        {hasSkills && (
                          <button
                            onClick={() => {
                              setSkillForm(prev => ({ ...prev, category: category.id }));
                              setShowSkillModal(true);
                            }}
                            className="text-xs text-purple-400 hover:text-purple-300 transition-colors duration-300"
                          >
                            Add more
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Add All Skills Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleAddSkill}
                className="btn-primary px-6 py-3 rounded-full flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Add New Skill
              </button>
            </div>
          </section>

          <section className="glass-card p-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold">Reviews & Feedback</h2>
              {currentUser.exchanges > 0 ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-500 font-bold">
                   <Star className="w-4 h-4 fill-current" />
                   5.0 rating
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-500/10 text-gray-500 font-medium">
                   <Star className="w-4 h-4" />
                   N/A
                </div>
              )}
            </div>

            {/* Empty State for Reviews */}
            {currentUser.exchanges === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
                <p className="text-gray-400">Once you complete exchanges, you'll see reviews from your swap partners here.</p>
              </div>
            ) : (
              <div className="space-y-10">
                 {/* Reviews would go here when user has exchanges */}
              </div>
            )}
          </section>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-purple-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Plus className="w-5 h-5 text-gray-400 rotate-45" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    About Me
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about yourself and what skills you can share..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    rows={4}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter your location"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={updateLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-violet-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
            
      {/* Add Skill Modal */}
      <AnimatePresence>
        {showSkillModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/50"
            onClick={() => setShowSkillModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-2xl w-full shadow-2xl shadow-purple-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Add New Skill</h2>
                <button
                  onClick={() => setShowSkillModal(false)}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <Plus className="w-5 h-5 text-gray-400 rotate-45" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={skillForm.category}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  >
                    {SKILL_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id} className="bg-slate-900">
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Skill Title
                  </label>
                  <input
                    type="text"
                    value={skillForm.title}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., React Development, UI Design, Spanish"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={skillForm.description}
                    onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your expertise and what you can teach..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowSkillModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 border border-white/20 text-white rounded-xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSkill}
                  disabled={!skillForm.title.trim() || skillLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {skillLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Add Skill'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}