import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Search, Code, Smartphone, Palette, TrendingUp, Globe, PenTool, Music, ChefHat, Sparkles, Camera, Mic, Kanban, User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { USERS, SKILLS } from "../data/mockData";
import toast from 'react-hot-toast';
import { supabase } from '../config/supabase';

// Skill Categories with icons (same as Profile)
const SKILL_CATEGORIES = [
  { id: 'all', name: 'All Skills', icon: Search },
  { id: 'web', name: 'Web Dev', icon: Code },
  { id: 'mobile', name: 'Mobile Dev', icon: Smartphone },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'languages', name: 'Languages', icon: Globe },
  { id: 'writing', name: 'Writing', icon: PenTool },
  { id: 'music', name: 'Music', icon: Music },
  { id: 'cooking', name: 'Cooking', icon: ChefHat },
  { id: 'prompt', name: 'Prompt Eng', icon: Sparkles },
  { id: 'photography', name: 'Photography', icon: Camera },
  { id: 'speaking', name: 'Speaking', icon: Mic },
  { id: 'management', name: 'Project Mgmt', icon: Kanban },
];

// Color palette for avatar circles
const AVATAR_COLORS = [
  'from-purple-500 to-violet-600',
  'from-red-500 to-rose-600',
  'from-green-500 to-emerald-600',
  'from-blue-500 to-indigo-600',
  'from-yellow-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-teal-500 to-cyan-600',
  'from-orange-500 to-orange-600'
];

// Get color based on user name
const getAvatarColor = (userName: string) => {
  const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

// 30 Diverse Egyptian Experts with Professional Details
const EGYPTIAN_EXPERTS = [
  {
    id: 1,
    name: "Ahmed Mansour",
    initials: "AM",
    useAvatar: true,
    avatarType: "panda",
    topSkill: { title: "React Development", category: "web", icon: Code },
    skills: ["React", "TypeScript", "Node.js"],
    rating: 4.9,
    swaps: 23,
    bio: "Passionate Web Developer with 3 years experience in modern React applications"
  },
  {
    id: 2,
    name: "Sara Hassan",
    initials: "SH",
    useAvatar: false,
    gradient: "from-purple-500 to-violet-600",
    topSkill: { title: "Middle Eastern Cooking", category: "cooking", icon: ChefHat },
    skills: ["Egyptian Cuisine", "Levantine Dishes", "Desserts"],
    rating: 5.0,
    swaps: 31,
    bio: "Professional chef specializing in authentic Middle Eastern and Egyptian cuisine"
  },
  {
    id: 3,
    name: "Omar Sherif",
    initials: "OS",
    useAvatar: true,
    avatarType: "robot",
    topSkill: { title: "Prompt Engineering", category: "prompt", icon: Sparkles },
    skills: ["AI Prompts", "ChatGPT", "Midjourney"],
    rating: 4.7,
    swaps: 18,
    bio: "AI specialist helping businesses leverage cutting-edge language models"
  },
  {
    id: 4,
    name: "Mariam Ali",
    initials: "MA",
    useAvatar: false,
    gradient: "from-blue-500 to-indigo-600",
    topSkill: { title: "Arabic Language", category: "languages", icon: Globe },
    skills: ["Modern Arabic", "Classical Arabic", "Egyptian Dialect"],
    rating: 4.9,
    swaps: 27,
    bio: "Certified Arabic teacher with expertise in Modern Standard Arabic and Egyptian dialect"
  },
  {
    id: 5,
    name: "Khaled Ibrahim",
    initials: "KI",
    useAvatar: true,
    avatarType: "cat",
    topSkill: { title: "Mobile Development", category: "mobile", icon: Smartphone },
    skills: ["iOS", "Android", "React Native"],
    rating: 4.8,
    swaps: 22,
    bio: "Mobile app developer creating intuitive cross-platform applications"
  },
  {
    id: 6,
    name: "Fatima Mahmoud",
    initials: "FM",
    useAvatar: false,
    gradient: "from-pink-500 to-rose-600",
    topSkill: { title: "UI/UX Design", category: "design", icon: Palette },
    skills: ["Figma", "Adobe XD", "Prototyping"],
    rating: 4.6,
    swaps: 15,
    bio: "Creative designer focused on user-centered digital experiences"
  },
  {
    id: 7,
    name: "Youssef Abdel",
    initials: "YA",
    useAvatar: true,
    avatarType: "rabbit",
    topSkill: { title: "Photography", category: "photography", icon: Camera },
    skills: ["Portrait", "Landscape", "Event Photography"],
    rating: 4.9,
    swaps: 34,
    bio: "Professional photographer capturing moments across Egypt and the Middle East"
  },
  {
    id: 8,
    name: "Nadia Kamel",
    initials: "NK",
    useAvatar: false,
    gradient: "from-green-500 to-emerald-600",
    topSkill: { title: "Public Speaking", category: "speaking", icon: Mic },
    skills: ["Presentation Skills", "Debate Coaching", "Corporate Training"],
    rating: 4.8,
    swaps: 19,
    bio: "Communication expert helping professionals master the art of public speaking"
  },
  {
    id: 9,
    name: "Mohamed Elsayed",
    initials: "ME",
    useAvatar: true,
    avatarType: "girl",
    topSkill: { title: "Project Management", category: "management", icon: Kanban },
    skills: ["Agile", "Scrum", "Team Leadership"],
    rating: 4.7,
    swaps: 26,
    bio: "PMP certified project manager with 8 years in tech and construction"
  },
  {
    id: 10,
    name: "Layla Hussein",
    initials: "LH",
    useAvatar: false,
    gradient: "from-orange-500 to-amber-600",
    topSkill: { title: "Digital Marketing", category: "marketing", icon: TrendingUp },
    skills: ["SEO", "Social Media", "Content Strategy"],
    rating: 4.5,
    swaps: 21,
    bio: "Marketing strategist helping brands grow their online presence"
  },
  {
    id: 11,
    name: "Karim Nabil",
    initials: "KN",
    useAvatar: true,
    avatarType: "boy",
    topSkill: { title: "Music Production", category: "music", icon: Music },
    skills: ["Beat Making", "Audio Engineering", "MIDI Production"],
    rating: 4.8,
    swaps: 16,
    bio: "Music producer creating beats for artists across the Middle East"
  },
  {
    id: 12,
    name: "Rania Salah",
    initials: "RS",
    useAvatar: false,
    gradient: "from-teal-500 to-cyan-600",
    topSkill: { title: "Technical Writing", category: "writing", icon: PenTool },
    skills: ["Documentation", "API Writing", "Content Creation"],
    rating: 4.6,
    swaps: 13,
    bio: "Technical writer making complex concepts simple and accessible"
  },
  {
    id: 13,
    name: "Hassan Ali",
    initials: "HA",
    useAvatar: true,
    avatarType: "artist",
    topSkill: { title: "Web Development", category: "web", icon: Code },
    skills: ["Vue.js", "Python", "Django"],
    rating: 4.7,
    swaps: 24,
    bio: "Full-stack developer specializing in Python web frameworks"
  },
  {
    id: 14,
    name: "Mona Fathy",
    initials: "MF",
    useAvatar: false,
    gradient: "from-violet-500 to-purple-600",
    topSkill: { title: "Business English", category: "languages", icon: Globe },
    skills: ["Business English", "IELTS Prep", "Corporate Training"],
    rating: 4.9,
    swaps: 29,
    bio: "English language coach specializing in business communication"
  },
  {
    id: 15,
    name: "Tarek Omar",
    initials: "TO",
    useAvatar: true,
    avatarType: "scientist",
    topSkill: { title: "Data Science", category: "web", icon: Code },
    skills: ["Machine Learning", "Python", "Data Analysis"],
    rating: 4.8,
    swaps: 20,
    bio: "Data scientist helping businesses make data-driven decisions"
  },
  {
    id: 16,
    name: "Dalia Magdy",
    initials: "DM",
    useAvatar: false,
    gradient: "from-indigo-500 to-blue-600",
    topSkill: { title: "Graphic Design", category: "design", icon: Palette },
    skills: ["Branding", "Logo Design", "Print Design"],
    rating: 4.5,
    swaps: 17,
    bio: "Graphic designer creating memorable brand identities"
  },
  {
    id: 17,
    name: "Amr Ahmed",
    initials: "AA",
    useAvatar: true,
    avatarType: "panda",
    topSkill: { title: "Egyptian Cuisine", category: "cooking", icon: ChefHat },
    skills: ["Traditional Egyptian", "Street Food", "Halal Cooking"],
    rating: 5.0,
    swaps: 35,
    bio: "Master chef preserving authentic Egyptian culinary traditions"
  },
  {
    id: 18,
    name: "Salwa Gamal",
    initials: "SG",
    useAvatar: false,
    gradient: "from-rose-500 to-pink-600",
    topSkill: { title: "Content Writing", category: "writing", icon: PenTool },
    skills: ["Blog Writing", "Copywriting", "SEO Content"],
    rating: 4.4,
    swaps: 12,
    bio: "Content writer creating engaging stories for digital platforms"
  },
  {
    id: 19,
    name: "Mahmoud Reda",
    initials: "MR",
    useAvatar: true,
    avatarType: "robot",
    topSkill: { title: "AI Integration", category: "prompt", icon: Sparkles },
    skills: ["ChatGPT", "Automation", "AI Strategy"],
    rating: 4.6,
    swaps: 14,
    bio: "AI consultant helping businesses integrate artificial intelligence"
  },
  {
    id: 20,
    name: "Aya Khaled",
    initials: "AK",
    useAvatar: false,
    gradient: "from-cyan-500 to-teal-600",
    topSkill: { title: "Social Media Marketing", category: "marketing", icon: TrendingUp },
    skills: ["Instagram", "Facebook", "Content Strategy"],
    rating: 4.7,
    swaps: 25,
    bio: "Social media expert building strong online communities"
  },
  {
    id: 21,
    name: "Mostafa Ahmed",
    initials: "MA",
    useAvatar: true,
    avatarType: "panda",
    topSkill: { title: "Python Development", category: "web", icon: Code },
    skills: ["Python", "Django", "Data Science"],
    rating: 4.8,
    swaps: 19,
    bio: "Python developer specializing in web applications and data analysis"
  },
  {
    id: 22,
    name: "Nourhan Mohamed",
    initials: "NM",
    useAvatar: false,
    gradient: "from-amber-500 to-orange-600",
    topSkill: { title: "Fashion Design", category: "design", icon: Palette },
    skills: ["Fashion Sketching", "Pattern Making", "Styling"],
    rating: 4.6,
    swaps: 22,
    bio: "Fashion designer creating modern and traditional Egyptian clothing"
  },
  {
    id: 23,
    name: "Ali Hassan",
    initials: "AH",
    useAvatar: true,
    avatarType: "robot",
    topSkill: { title: "DevOps Engineering", category: "web", icon: Code },
    skills: ["Docker", "Kubernetes", "CI/CD"],
    rating: 4.9,
    swaps: 28,
    bio: "DevOps engineer optimizing deployment pipelines and infrastructure"
  },
  {
    id: 24,
    name: "Salma Mahmoud",
    initials: "SM",
    useAvatar: false,
    gradient: "from-indigo-500 to-purple-600",
    topSkill: { title: "Translation Services", category: "languages", icon: Globe },
    skills: ["English-Arabic", "French-Arabic", "Technical Translation"],
    rating: 4.7,
    swaps: 18,
    bio: "Professional translator providing accurate language services"
  },
  {
    id: 25,
    name: "Omar Khaled",
    initials: "OK",
    useAvatar: true,
    avatarType: "cat",
    topSkill: { title: "Game Development", category: "web", icon: Code },
    skills: ["Unity", "C#", "2D/3D Graphics"],
    rating: 4.5,
    swaps: 15,
    bio: "Game developer creating engaging mobile and PC games"
  },
  {
    id: 26,
    name: "Hend Ahmed",
    initials: "HA",
    useAvatar: false,
    gradient: "from-pink-500 to-rose-600",
    topSkill: { title: "Yoga Instruction", category: "speaking", icon: Mic },
    skills: ["Hatha Yoga", "Meditation", "Wellness Coaching"],
    rating: 4.8,
    swaps: 21,
    bio: "Certified yoga instructor promoting health and mindfulness"
  },
  {
    id: 27,
    name: "Mahmoud Fathy",
    initials: "MF",
    useAvatar: true,
    avatarType: "scientist",
    topSkill: { title: "Blockchain Development", category: "web", icon: Code },
    skills: ["Solidity", "Web3", "Smart Contracts"],
    rating: 4.6,
    swaps: 17,
    bio: "Blockchain developer building decentralized applications"
  },
  {
    id: 28,
    name: "Rania Ali",
    initials: "RA",
    useAvatar: false,
    gradient: "from-teal-500 to-cyan-600",
    topSkill: { title: "Video Editing", category: "design", icon: Palette },
    skills: ["Adobe Premiere", "Final Cut Pro", "Motion Graphics"],
    rating: 4.7,
    swaps: 24,
    bio: "Video editor creating compelling visual content"
  },
  {
    id: 29,
    name: "Khaled Mohamed",
    initials: "KM",
    useAvatar: true,
    avatarType: "boy",
    topSkill: { title: "Cybersecurity", category: "web", icon: Code },
    skills: ["Network Security", "Ethical Hacking", "Risk Assessment"],
    rating: 4.9,
    swaps: 26,
    bio: "Cybersecurity expert protecting digital assets and infrastructure"
  },
  {
    id: 30,
    name: "Mona Ahmed",
    initials: "MA",
    useAvatar: false,
    gradient: "from-violet-500 to-purple-600",
    topSkill: { title: "Business Consulting", category: "management", icon: Kanban },
    skills: ["Strategy Planning", "Market Analysis", "Business Development"],
    rating: 4.8,
    swaps: 23,
    bio: "Business consultant helping companies grow and optimize operations"
  }
];

export default function Explore() {
  const router = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState(EGYPTIAN_EXPERTS);
  const [loading, setLoading] = useState(true);
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user from Supabase auth
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error getting current user:', error);
        setCurrentUser(null);
      }
    };
    getCurrentUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch real users from Supabase
  useEffect(() => {
    const fetchRealUsers = async () => {
      try {
        setLoading(true);
        
        // Query with JOIN to fetch all profiles with their skills
        const { data, error } = await supabase
          .from('profiles')
          .select('*, skills(title)')
          .order('full_name', { ascending: true });

        if (error) {
          console.error('Error fetching profiles:', error);
          setRealUsers([]);
          setLoading(false);
          return;
        }

        // Safe data handling - check if data exists and has length
        if (data && data.length > 0) {
          // Find Maryam Khaled and place her at element 20
          const maryamIndex = data.findIndex(p => p.full_name?.includes('Maryam Khaled'));
          if (maryamIndex > -1) {
            const [maryam] = data.splice(maryamIndex, 1);
            const targetIndex = 19; // Position 20 = index 19
            data.splice(targetIndex, 0, maryam);
          }

          // Transform profiles to match expected structure
          const transformedUsers = data.map(profile => ({
            id: profile.user_id,
            name: profile.full_name || 'Unknown User',
            initials: (profile.full_name || 'Unknown User').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            useAvatar: !!profile.avatar_url,
            avatar_url: profile.avatar_url,
            gradient: getAvatarColor(profile.user_id || profile.full_name || 'Unknown User'),
            bio: profile.bio || 'No bio available',
            skills: profile.skills || [],
            rating: profile.rating || 0,
            swaps: profile.swaps_count || 0,
            trust_score: profile.rating || 0,
            exchanges: profile.swaps_count || 0,
            topSkill: profile.skills && profile.skills.length > 0 ? {
              title: profile.skills[0].title,
              category: 'web',
              icon: Code
            } : {
              title: 'New Member',
              category: 'all',
              icon: Search
            }
          }));

          setRealUsers(transformedUsers);
        } else {
          console.log('No profiles found or empty data');
          setRealUsers([]);
        }
      } catch (error) {
        console.error('Error in fetchRealUsers:', error);
        setRealUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRealUsers();

    // Set up Supabase realtime for auto-refresh
    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          console.log('Profile change detected:', payload);
          fetchRealUsers(); // Re-fetch users when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter out duplicate names, keeping only first occurrence
  const filterDuplicates = (users: any[]) => {
    const seenNames = new Set<string>();
    return users.filter(user => {
      const userName = user.name || '';
      if (seenNames.has(userName)) {
        return false; // Skip duplicate
      }
      seenNames.add(userName);
      return true; // Keep first occurrence
    });
  };

  // Stable sorting function with manual positioning
  const getStableSortedUsers = (users: any[]) => {
    // Safe check for empty or undefined array
    if (!users || users.length === 0) {
      return [];
    }
    
    // Sort by name ascending for stable ordering
    const sortedProfiles = [...users].sort((a, b) => {
      const nameA = a.name || a.full_name || '';
      const nameB = b.name || b.full_name || '';
      return nameA.localeCompare(nameB);
    });
    
    // Find Maryam and place her in middle
    const maryamIndex = sortedProfiles.findIndex(p => {
      const name = p.name || p.full_name || '';
      return name.includes('Maryam');
    });
    
    if (maryamIndex > -1) {
      const [maryam] = sortedProfiles.splice(maryamIndex, 1);
      const targetIndex = Math.floor(sortedProfiles.length / 2); // Middle position
      sortedProfiles.splice(targetIndex, 0, maryam);
    }
    
    return sortedProfiles;
  };

  // Merge real users with dummy data and filter duplicates
  useEffect(() => {
    const allUsers = [...EGYPTIAN_EXPERTS, ...realUsers];
    const filteredUsers = filterDuplicates(allUsers);
    const stableSorted = getStableSortedUsers(filteredUsers);
    setFilteredUsers(stableSorted);
  }, [realUsers]);

  const handleCategoryFilter = (categoryId: string) => {
    setActiveCategory(categoryId);
    
    const allUsers = [...EGYPTIAN_EXPERTS, ...realUsers];
    let filtered = filterDuplicates(allUsers); // Filter duplicates first
    const stableSorted = getStableSortedUsers(filtered); // Apply stable sorting
    
    if (categoryId !== 'all') {
      filtered = filtered.filter(user => {
        // Handle real users with skills array
        if (user.skills && Array.isArray(user.skills)) {
          return user.skills.some((skill: any) => {
            // Map skill category names to match filter
            const skillCategory = skill.category?.toLowerCase() || skill.title?.toLowerCase() || '';
            return skillCategory === categoryId || 
                   skill.title?.toLowerCase() === categoryId || // For Photography and Art
                   skill.title?.toLowerCase().includes('photography') && categoryId === 'photography' ||
                   skill.title?.toLowerCase().includes('art') && categoryId === 'design';
          });
        }
        // Handle mock users with topSkill.category
        return user.topSkill?.category === categoryId;
      });
    }
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(user => {
        const userName = user.name || '';
        const userBio = user.bio || '';
        
        // Handle real users with skills array
        if (user.skills && Array.isArray(user.skills)) {
          const skillTitles = user.skills.map((skill: any) => skill.title || '').join(' ');
          return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 userBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 skillTitles.toLowerCase().includes(searchQuery.toLowerCase());
        }
        
        // Handle mock users
        return userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               userBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
               user.topSkill?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               user.skills?.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
      });
    }
    
    const finalSorted = getStableSortedUsers(filtered);
    setFilteredUsers(finalSorted);
  };

  const handleSearch = async (searchTerm: string) => {
    setSearchQuery(searchTerm);
    
    if (!searchTerm.trim()) {
      const allUsers = [...EGYPTIAN_EXPERTS, ...realUsers];
      const filteredUsers = filterDuplicates(allUsers);
      const stableSorted = getStableSortedUsers(filteredUsers);
      setFilteredUsers(stableSorted);
      return;
    }
    
    if (searchTerm.trim()) {
      let filtered = realUsers.filter(user => {
        const userName = user.name || '';
        const userBio = user.bio || '';
        
        // Handle real users with skills array
        if (user.skills && Array.isArray(user.skills)) {
          const skillTitles = user.skills.map((skill: any) => skill.title || '').join(' ');
          return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 userBio.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 skillTitles.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        // Handle mock users
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               userBio.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.topSkill?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      });
      const finalSorted = getStableSortedUsers(filtered);
      setFilteredUsers(finalSorted);
    }
  };

  const handleSwapRequest = (userName: string) => {
    // toast.success(`Swap request sent to ${userName}!`);
  };

  // Get avatar SVG based on type
  const getAvatarSvg = (avatarType: string) => {
    const avatars: { [key: string]: React.ReactElement } = {
      panda: (
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
      cat: (
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
      robot: (
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
      rabbit: (
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
      girl: (
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
      boy: (
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
      artist: (
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
      scientist: (
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
      )
    };
    return avatars[avatarType] || avatars.panda;
  };

  return (
    <div className="min-h-screen pt-32 pb-24 max-w-7xl mx-auto px-6">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-violet-600 bg-clip-text text-transparent">
          Discover your next skill swap
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
          Connect with talented individuals and exchange expertise in a premium marketplace for skills
        </p>
        
        {/* Glassmorphism Search Bar */}
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-purple-400 transition-colors z-10" />
          <input 
            type="text" 
            placeholder="Search for specific skills or users..." 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-800/50 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:bg-slate-800/70 backdrop-blur-xl transition-all"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-700 animate-pulse" />
                <div className="flex-1">
                  <div className="h-6 bg-slate-700 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-slate-700 rounded animate-pulse w-24" />
                </div>
              </div>
              <div className="h-4 bg-slate-700 rounded animate-pulse mb-2" />
              <div className="h-4 bg-slate-700 rounded animate-pulse w-32" />
              <div className="h-10 bg-slate-700 rounded animate-pulse mt-4" />
            </div>
          ))}
        </div>
      )}
      
      {/* Skills Category Filter */}
      <div className="mb-12">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {SKILL_CATEGORIES.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryFilter(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-purple-500 to-violet-600 border-purple-400 text-white shadow-lg shadow-purple-500/30"
                  : "bg-white/5 border-white/20 text-slate-400 hover:border-white/40 hover:text-white hover:bg-white/10"
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{category.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {filteredUsers.length} Expert{filteredUsers.length !== 1 ? 's' : ''} Found
          </h2>
          <div className="text-sm text-slate-400">
            {activeCategory !== 'all' && (
              <span>Filter: {SKILL_CATEGORIES.find(cat => cat.id === activeCategory)?.name}</span>
            )}
          </div>
        </div>

        {/* User Cards Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeCategory}-${searchQuery}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUsers.map((user, index) => {
              // Handle real users vs mock users
              const isRealUser = !user.useAvatar && !user.avatarType; // Real users don't have these mock properties
              const userSkills = isRealUser ? (user.skills || []) : [];
              const topSkill = user.topSkill;
              const skillList = isRealUser ? userSkills : user.skills;
              
              return (
              <motion.div
                key={user.id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass-card p-6 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-300 hover:scale-105"
              >
                {/* User Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    {/* Display avatar_url if available, otherwise show default */}
                    {user.avatar_url ? (
                      <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                        <img 
                          src={user.avatar_url} 
                          alt={user.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : user.useAvatar ? (
                      <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-purple-500/30 flex items-center justify-center overflow-hidden">
                        {getAvatarSvg(user.avatarType)}
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${user.gradient || 'from-purple-500 to-violet-600'} border-2 border-purple-500/30 flex items-center justify-center`}>
                        <span className="text-white font-bold text-lg">{user.initials || (user.name || '').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{user.name || 'Unknown User'}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <span>⭐ {typeof (user.rating || user.trust_score) === 'number' ? (user.rating || user.trust_score).toFixed(1) : (user.rating || user.trust_score || 'N/A')}</span>
                      <span>•</span>
                      <span>{user.swaps || user.exchanges || 0} swaps</span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {user.bio === 'No bio available' ? (
                      <span className="text-slate-400 italic">Looking to exchange skills and learn from others! 🤝</span>
                    ) : (
                      user.bio
                    )}
                  </p>
                </div>

                {/* Top Skill */}
                {topSkill && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center">
                        <topSkill.icon className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{topSkill.title}</h4>
                        <p className="text-xs text-slate-500 capitalize">{topSkill.category}</p>
                      </div>
                    </div>
                    
                    {/* Display skills from skills table */}
                    <div className="flex flex-wrap gap-1">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.slice(0, 3).map((skill: any, skillIndex: number) => (
                          <span key={skillIndex} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300">
                            {skill.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No skills added yet</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {!loading && (() => {
                  console.log('Current User ID:', currentUser?.id, 'Profile User ID:', user.user_id, 'Profile ID field:', user.id);
                  const isMe = currentUser && (currentUser.id === user.user_id || currentUser.id === user.id);
                  if (isMe) {
                    return (
                      <button
                        onClick={() => router('/profile')}
                        className="w-full px-4 py-2 border border-purple-500 text-purple-400 bg-transparent rounded-xl hover:bg-purple-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <User className="w-4 h-4" />
                        <span>View Profile</span>
                      </button>
                    );
                  } else if (!isMe) {
                    return (
                      <button
                        onClick={() => handleSwapRequest(user.name || 'Unknown User')}
                        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Request Swap</span>
                      </button>
                    );
                  }
                })()}
              </motion.div>
            )})}
          </motion.div>
        </AnimatePresence>

        {/* Empty State */}
        {!loading && filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 glass-card"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">No experts found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your filters or search terms</p>
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                const allUsers = [...EGYPTIAN_EXPERTS, ...realUsers];
                const filteredUsers = filterDuplicates(allUsers); // Filter duplicates when clearing filters
                const stableSorted = getStableSortedUsers(filteredUsers);
                setFilteredUsers(stableSorted);
              }}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-400 hover:to-violet-500 transition-all"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
