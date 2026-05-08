import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Image, Paperclip, MoreVertical, Phone, Video, Search, MessageCircle, Plus, Smile, Users, Wifi, WifiOff, Mic } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { supabase } from '../config/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import LogoutModal from '../components/shared/LogoutModal';
import { getSafeName, getSafeAvatar, getSafeInitials } from '../utils/safeFallbacks';
import { shouldRenderConversation, filterValidConversations } from '../utils/userValidation';

interface Profile { id: string; full_name: string | null; bio: string | null; avatar_url: string | null; }
interface Conversation { id: string; participant_one: string; participant_two: string; created_at: string; other_user?: Profile; last_message?: string; last_message_time?: string; }
interface Message { id: string; conversation_id: string; sender_id: string; content: string; created_at: string; is_read: boolean; }

// Modern Avatar Component with Colorful Initials
function ModernAvatar({ name, size = "medium", avatarUrl, isCurrentUser = false }: { 
  name: string; 
  size?: "small" | "medium" | "large"; 
  avatarUrl?: string | null; 
  isCurrentUser?: boolean;
}) {
  // Use safe fallback utilities
  const safeName = name || 'Member';
  const initials = getSafeInitials(safeName);
  const sizeClasses = { 
    small: "w-12 h-12 text-sm", 
    medium: "w-14 h-14 text-base", 
    large: "w-16 h-16 text-lg" 
  };
  
  // Professional color palette for initials
  const colors = [
    'from-blue-500 to-blue-600', 
    'from-pink-500 to-pink-600', 
    'from-yellow-500 to-yellow-600', 
    'from-orange-500 to-orange-600',
    'from-green-500 to-green-600'
  ];
  const color = colors[safeName ? safeName.charCodeAt(0) % colors.length : 0];
  
  // Show real photo if available for any user
  if (avatarUrl && avatarUrl.trim() !== '') {
    return (
      <div className={`rounded-full overflow-hidden border border-white/20 ${sizeClasses[size]}`}>
        <img src={avatarUrl} alt={safeName} className="w-full h-full object-cover rounded-full aspect-square" />
      </div>
    );
  }
  
  // Otherwise show colored initials
  return (
    <div className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold border border-white/20 ${sizeClasses[size]}`}>
      {initials}
    </div>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [sending, setSending] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const realtimeRef = useRef<any>(null);

  // Pass conversations count to parent via custom event
  useEffect(() => {
    if (conversations.length > 0) {
      const event = new CustomEvent('updateConversationsCount', { detail: conversations.length });
      window.dispatchEvent(event);
    }
  }, [conversations.length]);
  
  // Real-time presence states with realistic tracking
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [userPresences, setUserPresences] = useState<Map<string, 'online' | 'offline' | 'away'>>(new Map());
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  // Simulate realistic presence for demo (remove in production)
  const [lastSeen, setLastSeen] = useState<Map<string, Date>>(new Map());
  
  // Track recently added friends for badge display
  const [recentlyAddedFriends, setRecentlyAddedFriends] = useState<Set<string>>(new Set());

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setCurrentUser(session.user);
    };
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setCurrentUser(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const setupRealtimeSubscription = async () => {
      if (!currentUser?.id) return;
      
      const channel = supabase.channel(`chat_${currentUser.id}`);
      
      channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new;
            if (newMessage.conversation_id === activeConversation?.id) {
              setMessages(prev => [...prev, {
                id: newMessage.id,
                conversation_id: newMessage.conversation_id,
                sender_id: newMessage.sender_id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                is_read: false
              }]);
              setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, last_message: newMessage.content, last_message_time: newMessage.created_at } : c));
            }
          }
        })
        .subscribe();
        
      channel
        .on('broadcast', { event: 'typing' }, (payload) => {
          setTypingUsers(prev => {
            const newTypingUsers = new Set(prev);
            if (payload.payload.user_id !== currentUser.id && payload.payload.status === 'typing') {
              newTypingUsers.add(payload.payload.user_id);
            } else {
              newTypingUsers.delete(payload.payload.user_id);
            }
            return newTypingUsers;
          });
        })
        .subscribe();
      
      realtimeRef.current = { channel, unsubscribe: () => channel.unsubscribe() };
    };
    
    if (currentUser) {
      setupRealtimeSubscription();
    }
    
    return () => {
      if (realtimeRef.current) {
        realtimeRef.current.unsubscribe();
      }
    };
  }, [currentUser?.id, activeConversation?.id]);

  useEffect(() => { 
    if (currentUser) {
      loadAllUsers(); // Load users only when current user is available
    }
  }, [currentUser]);

  // Handle URL parameter for direct user chat
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetUserId = urlParams.get('user');
    
    if (targetUserId && allUsers.length > 0) {
      const targetUser = allUsers.find(user => user.id === targetUserId);
      if (targetUser) {
        setSelectedUser(targetUser);
        startConversationWith(targetUser);
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [allUsers, currentUser]);

  useEffect(() => { 
    if (currentUser) { 
      loadConversations(); 
    } 
  }, [currentUser]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  useEffect(() => {
    if (!activeConversation) return;
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    const channel = supabase.channel(`messages:${activeConversation.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConversation.id}` },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
          setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, last_message: newMsg.content, last_message_time: newMsg.created_at } : c));
        }).subscribe();
    realtimeRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [activeConversation]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(allUsers);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      const filtered = allUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, allUsers]);

  const loadAllUsers = async () => {
    setLoadingUsers(true);
    
    // Fetch users from conversations table - show all profiles where id is either participant_one or participant_two in my active conversations
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_one_profile:participant_one (id, full_name, avatar_url, bio),
        participant_two_profile:participant_two (id, full_name, avatar_url, bio)
      `)
      .or(`participant_one.eq.${currentUser?.id},participant_two.eq.${currentUser?.id}`);
    
    if (error) {
      console.error('Error loading users:', error);
    } else {
      // Process conversations to extract unique users (excluding current user)
      const conversations = data || [];
      const uniqueUsers: Profile[] = [];
      const seenUserIds = new Set();
      
      conversations.forEach(conv => {
        // Add participant_one if not current user and not already added
        if (conv.participant_one_profile && 
            conv.participant_one !== currentUser?.id && 
            !seenUserIds.has(conv.participant_one_profile.id)) {
          uniqueUsers.push(conv.participant_one_profile);
          seenUserIds.add(conv.participant_one_profile.id);
        }
        
        // Add participant_two if not current user and not already added
        if (conv.participant_two_profile && 
            conv.participant_two !== currentUser?.id && 
            !seenUserIds.has(conv.participant_two_profile.id)) {
          uniqueUsers.push(conv.participant_two_profile);
          seenUserIds.add(conv.participant_two_profile.id);
        }
      });
      
      const filteredData = uniqueUsers.filter(user => {
        // Skip null/undefined users
        if (!user || user === null) return false;
        
        return true;
      });
      
      setAllUsers(filteredData);
      setFilteredUsers(filteredData);
      
      // Auto-select first user if no user is selected and we have available users
      if (!selectedUser && filteredData.length > 0) {
        setSelectedUser(filteredData[0]);
      }
      // If current user was selected, switch to first available user
      else if (selectedUser && currentUser && selectedUser.id === currentUser.id && filteredData.length > 0) {
        setSelectedUser(filteredData[0]);
      }
    }
    setLoadingUsers(false);
  };

  const selectUser = (user: Profile) => {
    setSelectedUser(user);
    setSearchQuery('');
  };

  const loadConversations = async () => {
    if (!currentUser) return;
    setLoadingConversations(true);
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_one_profile:participant_one (
          id, 
          full_name, 
          username, 
          email, 
          avatar_url, 
          bio
        ),
        participant_two_profile:participant_two (
          id, 
          full_name, 
          username, 
          email, 
          avatar_url, 
          bio
        )
      `)
      .or(`participant_one.eq.${currentUser.id},participant_two.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) { setLoadingConversations(false); return; }
    const enriched = await Promise.all(data.map(async (conv) => {
      const otherId = conv.participant_one === currentUser.id ? conv.participant_two : conv.participant_one;
      const isParticipantOne = conv.participant_one === currentUser.id;
      
      // Use joined profile data
      const profileData = isParticipantOne ? conv.participant_two_profile : conv.participant_one_profile;
      const { data: lastMsg } = await supabase.from('messages').select('content, created_at').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).single();
      
      // Safe fallback logic for user data
      const safeName = getSafeName(profileData, { id: otherId });
      const safeProfile = profileData || { 
        id: otherId, 
        full_name: safeName, 
        email: null, 
        avatar_url: getSafeAvatar(profileData, safeName)
      };
      
      return { 
        ...conv, 
        other_user: safeProfile, 
        last_message: lastMsg?.content || 'No messages yet', 
        last_message_time: lastMsg?.created_at || conv.created_at 
      };
    }));
    
    // Filter out corrupted conversations using validation utilities
    const validConversations = filterValidConversations(enriched);
    
    console.log(`Filtered conversations: ${validConversations.length} valid out of ${enriched.length} total`);
    setConversations(validConversations);
    setLoadingConversations(false);
  };

  const loadMessages = async (conversationId: string) => {
    setLoadingMessages(true);
    const { data } = await supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true });
    setMessages(data || []);
    setLoadingMessages(false);
  };

  const openConversation = (conv: Conversation) => {
    setActiveConversation(conv);
    setSearchQuery('');
    loadMessages(conv.id);
  };

  const startConversationWith = async (profile: Profile) => {
    if (!currentUser) return;
    setSearchQuery('');
    const existing = conversations.find(c => (c.participant_one === currentUser.id && c.participant_two === profile.id) || (c.participant_one === profile.id && c.participant_two === currentUser.id));
    if (existing) { openConversation(existing); return; }
    const { data, error } = await supabase.from('conversations').insert({ participant_one: currentUser.id, participant_two: profile.id }).select().single();
    if (error) { console.error('Error:', error); return; }
    const newConv: Conversation = { ...data, other_user: profile, last_message: 'No messages yet', last_message_time: data.created_at };
    setConversations(prev => [newConv, ...prev]);
    openConversation(newConv);
  };

  // Load conversation when conversationId is present in URL
  useEffect(() => {
    if (conversationId && currentUser) {
      const loadConversationFromUrl = async () => {
        setLoadingConversation(true);
        try {
          // Fetch conversation details
          const { data: conversation, error: convError } = await supabase
            .from('conversations')
            .select(`
              *,
              participant_one_profile:participant_one (
                id, full_name, avatar_url, bio
              ),
              participant_two_profile:participant_two (
                id, full_name, avatar_url, bio
              )
            `)
            .eq('id', conversationId)
            .single();

          if (convError) {
            console.error('Error loading conversation:', convError);
            return;
          }

          if (conversation) {
            // Determine which participant is the other user
            const otherUser = conversation.participant_one === currentUser.id 
              ? conversation.participant_two_profile
              : conversation.participant_one_profile;

            const conversationWithUser: Conversation = {
              ...conversation,
              other_user: otherUser
            };

            setActiveConversation(conversationWithUser);
            setSelectedUser(otherUser);
            
            // Load messages for this conversation
            await loadMessages(conversationId);
          }
        } catch (error) {
          console.error('Error loading conversation from URL:', error);
        } finally {
          setLoadingConversation(false);
        }
      };

      loadConversationFromUrl();
    }
  }, [conversationId, currentUser]);

  const sendMessage = async () => {
    if (!inputVal.trim() || !activeConversation || !currentUser || sending) return;
    const content = inputVal.trim();
    setInputVal('');
    setSending(true);
    const tempMsg: Message = { id: `temp-${Date.now()}`, conversation_id: activeConversation.id, sender_id: currentUser.id, content, created_at: new Date().toISOString(), is_read: false };
    setMessages(prev => [...prev, tempMsg]);
    const { data, error } = await supabase.from('messages').insert({ conversation_id: activeConversation.id, sender_id: currentUser.id, content }).select().single();
    if (error) { setMessages(prev => prev.filter(m => m.id !== tempMsg.id)); setInputVal(content); }
    else if (data) {
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? data : m));
      setConversations(prev => prev.map(c => c.id === activeConversation.id ? { ...c, last_message: content, last_message_time: data.created_at } : c));
    }
    setSending(false);
  };

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatRelative = (ts: string) => {
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`;
    return `${Math.floor(mins / 1440)}d ago`;
  };

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-transparent">
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar - Professional Design */}
        <aside className="w-80 h-full bg-slate-800/50 backdrop-blur-md border-r border-purple-500/10 flex flex-col pt-0">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-white">Messages ({conversations.length})</h2>
            <button className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Active Users Section - Stories Style */}
          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Active</h3>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredUsers.slice(0, 6).map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => selectUser(profile)}
                  className="flex-shrink-0 flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-slate-700/30 transition-all cursor-pointer group"
                >
                  <div className="relative">
                    <ModernAvatar 
                      name={getSafeName(profile)} 
                      size="small" 
                      avatarUrl={profile?.avatar_url}
                      isCurrentUser={false}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800"></div>
                  </div>
                  <div className="text-xs text-slate-300 text-center max-w-[60px] truncate">
                    {getSafeName(profile).split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pinned Messages Section */}
          <div className="px-5 py-3 border-t border-slate-700/30">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Pinned Message</h3>
            <div className="space-y-1">
              {conversations.slice(0, 2).map((conv) => {
                const friendProfile = conv.participant_one === currentUser?.id ? conv.participant_two_profile : conv.participant_one_profile;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer relative ${
                      activeConversation?.id === conv.id 
                        ? 'bg-purple-600/20 border-l-4 border-l-purple-500' 
                        : 'hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="relative">
                      <ModernAvatar 
                        name={getSafeName(friendProfile || {})} 
                        size="small" 
                        avatarUrl={friendProfile?.avatar_url}
                        isCurrentUser={false}
                      />
                      {/* Unread Badge */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-semibold text-white truncate">
                        {getSafeName(friendProfile || {})}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {conv.last_message || 'No messages yet'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {conv.last_message_time ? formatTime(conv.last_message_time) : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* All Messages Section */}
          <div className="px-5 py-3 border-t border-slate-700/30">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">All Messages</h3>
            <div className="space-y-1">
              {conversations.slice(2).map((conv) => {
                const friendProfile = conv.participant_one === currentUser?.id ? conv.participant_two_profile : conv.participant_one_profile;
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer relative ${
                      activeConversation?.id === conv.id 
                        ? 'bg-purple-600/20 border-l-4 border-l-purple-500' 
                        : 'hover:bg-slate-700/30'
                    }`}
                  >
                    <div className="relative">
                      <ModernAvatar 
                        name={getSafeName(friendProfile || {})} 
                        size="small" 
                        avatarUrl={friendProfile?.avatar_url}
                        isCurrentUser={false}
                      />
                      {/* Unread Badge */}
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-semibold text-white truncate">
                        {getSafeName(friendProfile || {})}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {conv.last_message || 'No messages yet'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {conv.last_message_time ? formatTime(conv.last_message_time) : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Chat Window - Takes remaining space */}
      <main className="flex-1 h-full flex flex-col bg-slate-900/30 backdrop-blur-sm">
        {selectedUser ? (
          <>
            {/* Chat Header - Compact */}
            <header className="h-12 border-b border-slate-700/30 bg-slate-800/30 backdrop-blur-md flex items-center px-4">
              <div className="flex items-center gap-3 flex-1">
                <ModernAvatar 
                  name={selectedUser.full_name || 'User'} 
                  size="small" 
                  avatarUrl={selectedUser.avatar_url}
                  isCurrentUser={false}
                />
                <div>
                  <div className="font-semibold text-white text-sm">{selectedUser?.full_name || 'Unknown User'}</div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 relative">
                      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping" />
                    </div>
                    Active Now
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-gray-300 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-gray-300 transition-colors">
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </header>

            {/* Messages Area - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Start the conversation</h3>
                  <p className="text-gray-400 text-sm">Send your first message to {selectedUser?.full_name || 'this user'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMyMessage = message.sender_id === currentUser?.id;
                    return (
                      <div key={message.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md flex gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMyMessage && (
                            <ModernAvatar 
                              name={selectedUser?.full_name || 'User'} 
                              size="small" 
                              avatarUrl={selectedUser?.avatar_url}
                              isCurrentUser={false}
                            />
                          )}
                          <div className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`px-3 py-2 rounded-lg ${
                                isMyMessage
                                  ? 'bg-[#5C67F2] text-white rounded-br-md'
                                  : 'bg-[#2E3343] text-white rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed">{message.content}</p>
                            </div>
                            <div className={`text-xs mt-1 ${isMyMessage ? 'text-right' : 'text-left'} ${isMyMessage ? 'text-purple-300' : 'text-slate-400'} px-1`}>
                              {formatTime(message.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Message Input - Clean Design */}
            <footer className="border-t border-slate-700/30 bg-slate-800/30 backdrop-blur-md p-4">
              <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-600/50 rounded-full px-4 py-3 backdrop-blur-sm">
                <button className="p-1.5 rounded-full hover:bg-slate-700/50 text-slate-400 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Your message here..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder:text-slate-400 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      sendMessage();
                    }
                  }}
                />
                <button className="p-1.5 rounded-full hover:bg-slate-700/50 text-slate-400 transition-colors">
                  <Smile className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-slate-700/50 text-slate-400 transition-colors">
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!inputVal.trim()}
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-8 border border-purple-500/30">
                <MessageCircle className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-200 mb-4">Select a user to start chatting</h3>
              <p className="text-gray-400 text-lg">Choose from the user list to begin your skill swap conversation with {selectedUser?.full_name ?? 'a user'}</p>
            </div>
          </div>
        )}
      </main>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
      </div>
    </div>
  );
}
