import { useState, useRef, useEffect } from "react";
import { Send, Image, Paperclip, MoreVertical, Phone, Video, Search, MessageCircle, Code, Palette, Music, FileText } from "lucide-react";
import { USERS, CHATS, SKILLS } from "../data/mockData";
import { cn } from "../lib/utils";
import { motion } from "motion/react";

// Modern Avatar Component
function ModernAvatar({ name, size = "medium" }: { name: string; size?: "small" | "medium" | "large" }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const sizeClasses = {
    small: "w-8 h-8 text-xs",
    medium: "w-10 h-10 text-sm", 
    large: "w-12 h-12 text-base"
  };
  
  const avatarColors = [
    'from-purple-500 to-violet-600',
    'from-blue-500 to-indigo-600',
    'from-pink-500 to-rose-600',
    'from-green-500 to-emerald-600'
  ];
  
  const colorIndex = name.charCodeAt(0) % avatarColors.length;
  
  return (
    <div className={cn(
      "rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold border-2 border-white/20",
      sizeClasses[size]
    )}>
      {initials}
    </div>
  );
}

export default function Chat() {
  const [activeChatId, setActiveChatId] = useState('chat1');
  const [messages, setMessages] = useState([
    { id: 1, senderId: 'salma', text: "Hey Sarah! I saw you're looking to improve your Figma Auto-Layout. I can definitely help. I'm stuck on a React state management issue (using Context API).", time: "10:30 AM" },
    { id: 2, senderId: 'current', text: "Hi Salma! Context API can be tricky. I'd be happy to explain it. Auto-Layout is exactly what I need for my portfolio.", time: "10:32 AM" },
    { id: 3, senderId: 'current', text: "Awesome! A true swap. I can jump on a quick call later today to go over the Figma basics if you want?", time: "10:35 AM" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Mock chat data for realistic scenario
  const mockChats = [
    { 
      id: 'chat1', 
      participantId: 'salma',
      participantName: 'Salma Ezz',
      lastMessage: "Perfect, let's start...",
      time: "2m ago",
      skill: "React Development"
    },
    { 
      id: 'chat2', 
      participantId: 'ziad',
      participantName: 'Ziad Amr',
      lastMessage: "Thanks for the session!",
      time: "1h ago",
      skill: "UI/UX Design"
    }
  ];

  const activeChat = mockChats.find(c => c.id === activeChatId);
  const currentUser = {
    id: 'current',
    name: 'Sarah'
  };

  const sendMessage = () => {
    if (!inputVal.trim()) return;
    setMessages([...messages, {
      id: Date.now(),
      senderId: 'current',
      text: inputVal,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setInputVal("");
  };

  const getSkillIcon = (category: string) => {
    switch (category) {
      case 'Tech': return Code;
      case 'Music': return Music;
      case 'Writing': return FileText;
      case 'Art': return Palette;
      default: return Code;
    }
  };

  return (
    <div className="pt-24 h-screen flex flex-col max-w-7xl mx-auto w-full px-6 pb-6 relative overflow-hidden">
      {/* Lavender glow effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[150px] -z-10 animate-pulse" />
      
      <div className="flex-grow flex overflow-hidden">
        
        {/* Sidebar */}
        <aside className="w-80 border-r border-white/10 flex flex-col hidden md:flex backdrop-blur-xl bg-white/5">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold mb-4 text-white">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500 backdrop-blur-sm"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto scrollbar-hide py-2">
            {mockChats.map((chat) => {
              const SkillIcon = getSkillIcon(chat.skill === 'React Development' ? 'Tech' : 'Design');
              
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-6 py-4 transition-all hover:bg-white/5 border-l-4 backdrop-blur-sm",
                    activeChatId === chat.id 
                      ? "bg-purple-500/10 border-purple-500 shadow-lg shadow-purple-500/10" 
                      : "border-transparent hover:border-purple-500/30"
                  )}
                >
                  <div className="relative">
                    <ModernAvatar name={chat.participantName} size="medium" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center border-2 border-slate-900">
                      <SkillIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-grow text-left">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-gray-200 text-sm">{chat.participantName}</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{chat.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-300 truncate max-w-[120px]">{chat.lastMessage}</span>
                      <span className="text-xs text-purple-400 font-medium">
                        {chat.skill}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-grow flex flex-col backdrop-blur-xl bg-white/5 border-l border-white/10">
          {/* Header */}
          <header className="p-4 border-b border-white/10 flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ModernAvatar name={activeChat?.participantName || 'User'} size="medium" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="font-bold text-gray-200 leading-none mb-1">{activeChat?.participantName}</div>
                <div className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Active now
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"><Video className="w-4 h-4" /></button>
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"><MoreVertical className="w-4 h-4" /></button>
            </div>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4 border border-purple-500/30">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">
                  Start your first swap with {activeChat?.participantName}
                </h3>
                <p className="text-gray-300 text-sm max-w-md">
                  Send a message to begin your skill exchange journey. No money needed, just passion and knowledge!
                </p>
              </motion.div>
            )}
            
            {messages.length > 0 && (
              <>
                <div className="text-center py-4">
                   <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-500 font-bold uppercase tracking-widest backdrop-blur-sm">Today</span>
                </div>
                {messages.map((msg, index) => (
                  <motion.div 
                    key={msg.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex flex-col max-w-[70%] space-y-1",
                      msg.senderId === 'current' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "px-5 py-3 rounded-2xl text-sm leading-relaxed font-medium",
                        msg.senderId === 'current' 
                          ? "bg-gradient-to-r from-purple-600 to-violet-600 text-gray-100 rounded-tr-none shadow-[0_0_15px_rgba(139,92,246,0.3)] backdrop-blur-sm" 
                          : "bg-white/5 border border-white/20 text-gray-200 rounded-tl-none backdrop-blur-xl"
                      )}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">{msg.time}</span>
                  </motion.div>
                ))}
              </>
            )}
          </div>

          {/* Input Area */}
          <footer className="p-4 border-t border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 backdrop-blur-xl bg-white/5 border border-white/20 rounded-full p-2 ring-1 ring-white/10">
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition-all"><Paperclip className="w-4 h-4" /></button>
                <button className="p-2 rounded-full hover:bg-white/10 text-slate-400 transition-all"><Image className="w-4 h-4" /></button>
              </div>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-grow bg-transparent border-none text-sm text-gray-200 focus:ring-0 placeholder:text-gray-400 backdrop-blur-sm"
              />
              <button 
                onClick={sendMessage}
                className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105 border border-purple-500/30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
