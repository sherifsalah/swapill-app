import { useState, useRef, useEffect } from "react";
import { Send, Image, Paperclip, MoreVertical, Phone, Video, Search, MessageCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { supabase } from '../config/supabase';

interface Profile { user_id: string; full_name: string | null; bio: string | null; avatar_url: string | null; }
interface Conversation { id: string; participant_one: string; participant_two: string; created_at: string; other_user?: Profile; last_message?: string; last_message_time?: string; }
interface Message { id: string; conversation_id: string; sender_id: string; content: string; created_at: string; is_read: boolean; }

function ModernAvatar({ name, size = "medium", avatarUrl }: { name: string; size?: "small" | "medium" | "large"; avatarUrl?: string | null }) {
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  const sizeClasses = { small: "w-7 h-7 text-xs", medium: "w-9 h-9 text-sm", large: "w-11 h-11 text-base" };
  const colors = ['from-purple-500 to-violet-600', 'from-blue-500 to-indigo-600', 'from-pink-500 to-rose-600', 'from-green-500 to-emerald-600'];
  const color = colors[name ? name.charCodeAt(0) % colors.length : 0];
  
  // If avatarUrl exists, show image, otherwise show colored avatar
  if (avatarUrl) {
    return (
      <div className={cn(`rounded-full overflow-hidden border border-white/20`, sizeClasses[size])}>
        <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  
  return (
    <div className={cn(`rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold border border-white/20`, sizeClasses[size])}>
      {initials}
    </div>
  );
}

export default function Chat() {
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
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const realtimeRef = useRef<any>(null);

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
    loadAllUsers(); // Load users on component mount
  }, []);

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
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url, bio')
      .order('full_name', { ascending: true });
    
    if (error) {
      console.error('Error loading users:', error);
    } else {
      // Remove duplicates and filter out current user
      const uniqueUsers = data || [];
      const seenUserIds = new Set();
      const filteredData = uniqueUsers.filter(user => {
        // Skip current user
        if (currentUser && user.user_id === currentUser.id) return false;
        
        // Skip duplicates
        if (seenUserIds.has(user.user_id)) return false;
        seenUserIds.add(user.user_id);
        
        return true;
      });
      
      setAllUsers(filteredData);
      setFilteredUsers(filteredData);
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
    const { data, error } = await supabase.from('conversations').select('*').or(`participant_one.eq.${currentUser.id},participant_two.eq.${currentUser.id}`).order('created_at', { ascending: false });
    if (error || !data || data.length === 0) { setLoadingConversations(false); return; }
    const enriched = await Promise.all(data.map(async (conv) => {
      const otherId = conv.participant_one === currentUser.id ? conv.participant_two : conv.participant_one;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', otherId).single();
      const { data: lastMsg } = await supabase.from('messages').select('content, created_at').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).single();
      return { ...conv, other_user: profile || { id: otherId, full_name: 'Unknown', email: null, avatar_url: null }, last_message: lastMsg?.content || 'No messages yet', last_message_time: lastMsg?.created_at || conv.created_at };
    }));
    setConversations(enriched);
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

  return (
    <div className="h-screen w-full flex bg-slate-900">
      {/* Left Sidebar - 350px fixed width */}
      <aside className="w-[350px] bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-white">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-700 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 text-white placeholder:text-slate-400" 
            />
          </div>
        </div>

        {/* Users List - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading users...</div>
          ) : (
            <div className="p-4">
              <div className="p-2 text-xs text-slate-500 font-semibold uppercase tracking-wider mb-3">
                ALL USERS ({allUsers.length})
              </div>
              {allUsers.map(profile => (
                <button 
                  key={profile.user_id} 
                  type="button" 
                  onClick={() => selectUser(profile)} 
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 transition-all cursor-pointer rounded-lg mb-2",
                    selectedUser?.user_id === profile.user_id 
                      ? "bg-purple-600/20 border border-purple-500/30" 
                      : "hover:bg-slate-700/50"
                  )}
                >
                  <ModernAvatar name={profile.full_name || 'User'} size="small" avatarUrl={profile.avatar_url} />
                  <div className="text-left flex-grow">
                    <div className="text-sm font-medium text-gray-200">{profile.full_name || 'Unknown User'}</div>
                    {profile.bio && (
                      <div className="text-xs text-slate-400 truncate">{profile.bio}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Right Chat Window - Takes remaining space */}
      <main className="flex-1 flex flex-col bg-slate-900">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <header className="p-4 border-b border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <ModernAvatar name={selectedUser.full_name || 'User'} size="medium" avatarUrl={selectedUser.avatar_url} />
                <div className="flex-1">
                  <div className="font-bold text-gray-200">{selectedUser.full_name || 'Unknown User'}</div>
                  <div className="text-xs text-green-400 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> 
                    Active now
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-300"><Phone className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-300"><Video className="w-4 h-4" /></button>
                  <button className="p-2 rounded-lg hover:bg-slate-700 text-gray-300"><MoreVertical className="w-4 h-4" /></button>
                </div>
              </div>
            </header>

            {/* Message Area - Darker background for eye comfort */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-950/30">
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                  <MessageCircle className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-200 mb-3">Start chatting with {selectedUser.full_name}!</h3>
                <p className="text-gray-400 text-base max-w-lg leading-relaxed">Send your first message and start the skill swap conversation 🚀</p>
              </div>
            </div>

            {/* Message Input */}
            <footer className="p-4 border-t border-slate-700 bg-slate-800/50">
              <div className="flex items-center gap-3 bg-slate-700 border border-slate-600 rounded-full p-2">
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-full hover:bg-slate-600 text-slate-400"><Paperclip className="w-4 h-4" /></button>
                  <button className="p-2 rounded-full hover:bg-slate-600 text-slate-400"><Image className="w-4 h-4" /></button>
                </div>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  value={inputVal} 
                  onChange={(e) => setInputVal(e.target.value)} 
                  className="flex-1 bg-transparent border-none text-sm text-gray-200 focus:ring-0 placeholder:text-gray-400 outline-none" 
                />
                <button 
                  onClick={() => {}} 
                  disabled={!inputVal.trim()} 
                  className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </footer>
          </>
        ) : (
          /* Empty State - No user selected */
          <div className="flex-1 flex items-center justify-center bg-slate-950/30">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-8 border border-purple-500/30">
                <MessageCircle className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-3xl font-semibold text-gray-200 mb-4">Select a user to start chatting</h3>
              <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">Choose from the user list on the left to begin your skill swap conversation</p>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
}