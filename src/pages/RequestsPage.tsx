import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Check, X, UserPlus, Mail, Search, Filter } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface SwapRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export default function RequestsPage() {
  const { user: currentUser } = useAuth();
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('pending');
  const [recentlyAccepted, setRecentlyAccepted] = useState<Set<string>>(new Set());

  // Fetch incoming requests
  const fetchRequests = async () => {
    if (!currentUser?.id) {
      console.log('No current user or user ID found');
      return;
    }

    console.log('Current User ID:', currentUser.id);

    setLoading(true);
    try {
      // First try with explicit foreign key name
      let { data, error } = await supabase
        .from('swap_requests')
        .select(`
          id,
          status,
          created_at,
          sender_id,
          receiver_id,
          sender:profiles!swap_requests_sender_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('receiver_id', currentUser.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // If first query fails, try alternative foreign key name
      if (error) {
        console.log('First query failed, trying alternative foreign key name...');
        const result = await supabase
          .from('swap_requests')
          .select(`
            id,
            status,
            created_at,
            sender_id,
            receiver_id,
            sender:profiles!sender_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('receiver_id', currentUser.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
        
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Full Supabase Error:', error);
        console.error('Error Code:', error.code);
        console.error('Error Message:', error.message);
        console.error('Error Details:', error.details);
        toast.error('Failed to load requests');
      } else {
        console.log('Fetched requests data:', data);
        setRequests(data || []);
      }
    } catch (error) {
      console.error('Error in fetchRequests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // Accept request
  const handleAccept = async (requestId: string) => {
    try {
      console.log('=== ACCEPT REQUEST DEBUG ===');
      console.log('Request ID:', requestId);
      
      // Get the request details to get sender and receiver IDs first
      const { data: requestData, error: fetchError } = await supabase
        .from('swap_requests')
        .select('sender_id, receiver_id')
        .eq('id', requestId)
        .single();

      if (fetchError || !requestData) {
        console.error('Error fetching request details:', fetchError);
        console.error('Full fetch error:', fetchError);
        toast.error('Failed to get request details');
        return;
      }

      const { sender_id, receiver_id } = requestData;
      console.log('Sender ID:', sender_id);
      console.log('Receiver ID:', receiver_id);

      // Step 2: Check if conversation already exists
      const { data: existingConv, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(`participant_one.eq.${sender_id},participant_two.eq.${sender_id}`)
        .or(`participant_one.eq.${receiver_id},participant_two.eq.${receiver_id}`)
        .maybeSingle();

      let conversationId;

      if (checkError) {
        console.error('Error checking conversation:', checkError);
        console.error('Full check error details:', checkError);
        console.error('Check error code:', checkError.code);
        console.error('Check error message:', checkError.message);
        toast.error('Failed to check conversation');
        return;
      }

      console.log('Existing conversation found:', existingConv);

      // Step 3: Create new conversation if not exists
      if (!existingConv) {
        console.log('Creating new conversation...');
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_one: sender_id,
            participant_two: receiver_id
          })
          .select('id')
          .single();

        if (createError || !newConv) {
          console.error('Error creating conversation:', createError);
          console.error('Full create error details:', createError);
          console.error('Create error code:', createError.code);
          console.error('Create error message:', createError.message);
          toast.error('Failed to create conversation');
          return;
        }

        conversationId = newConv.id;
        console.log('New conversation created with ID:', conversationId);
      } else {
        conversationId = existingConv.id;
        console.log('Using existing conversation with ID:', conversationId);
      }

      // Step 4: Send welcome message
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: sender_id,
          content: "System: You are now connected! Start swapping your skills."
        });

      if (messageError) {
        console.error('Error sending welcome message:', messageError);
        console.error('Full message error details:', messageError);
        // Don't return here, still continue with status update
      }

      // Step 5: Update request status to 'accepted' (only after conversation is verified/created)
      console.log('Updating request status to accepted...');
      const { error: statusError } = await supabase
        .from('swap_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (statusError) {
        console.error('Error updating request status:', statusError);
        console.error('Full status error details:', statusError);
        toast.error('Failed to update request status');
        return;
      }

      // Step 6: Success UI
      console.log('Request accepted successfully!');
      toast.success('You are friends now! Start swapping skills.');
      
      // Track this request as recently accepted for UI feedback
      setRecentlyAccepted(prev => new Set(prev).add(requestId));
      
      // Update local state to remove or change request card
      setRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'accepted' } : req
        )
      );

      // Remove the 'recently accepted' status after 2 seconds
      setTimeout(() => {
        setRecentlyAccepted(prev => {
          const newSet = new Set(prev);
          newSet.delete(requestId);
          return newSet;
        });
      }, 2000);

    } catch (error) {
      console.error('Error in handleAccept:', error);
      toast.error('Failed to accept request');
    }
  };

  // Reject request
  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast.error('Failed to reject request');
      } else {
        toast.success('Request rejected');
        // Update local state
        setRequests(prev => 
          prev.map(req => 
            req.id === requestId ? { ...req, status: 'rejected' } : req
          )
        );
      }
    } catch (error) {
      console.error('Error in handleReject:', error);
      toast.error('Failed to reject request');
    }
  };

  // Filter requests based on search and status
  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.sender?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Get skill category color
  const getSkillColor = (category: string) => {
    const colors: Record<string, string> = {
      web: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      design: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      mobile: 'bg-green-500/20 text-green-300 border-green-500/30',
      backend: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      marketing: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      writing: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      video: 'bg-red-500/20 text-red-300 border-red-500/30',
      music: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      cooking: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      photography: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  useEffect(() => {
    fetchRequests();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-white text-lg">Please log in to view your requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-8 pb-24 max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-purple-400" />
          Swap Requests
        </h1>
        <p className="text-slate-400">Manage your incoming skill swap requests</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by sender name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
          />
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-xl px-4">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-transparent text-white border-none focus:outline-none"
          >
            <option value="pending" className="bg-slate-800">Pending</option>
            <option value="all" className="bg-slate-800">All</option>
            <option value="accepted" className="bg-slate-800">Accepted</option>
            <option value="rejected" className="bg-slate-800">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-slate-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No swap requests found
          </h3>
          <p className="text-slate-400">
            Keep exploring! New requests will appear here when someone wants to swap with you.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {/* Sender Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>

                  {/* Request Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {request.sender?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          wants to swap skills with you
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : request.status === 'accepted'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Sender Skills */}
                    {request.sender_skills && request.sender_skills.length > 0 && (
                      <div className="mb-4">
                        <p className="text-slate-400 text-sm mb-2">Skills offered:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.sender_skills.slice(0, 3).map((skill) => (
                            <span
                              key={skill.id}
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getSkillColor(skill.category)}`}
                            >
                              {skill.title}
                            </span>
                          ))}
                          {request.sender_skills.length > 3 && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400">
                              +{request.sender_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {request.status === 'pending' && (
                      <div className="flex gap-3">
                        {recentlyAccepted.has(request.id) ? (
                          <div className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg flex items-center gap-2 font-medium shadow-lg shadow-green-500/25">
                            <Check className="w-4 h-4" />
                            Connected
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAccept(request.id)}
                              className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg shadow-green-500/25"
                            >
                              <Check className="w-4 h-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="px-6 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-all duration-300 flex items-center gap-2 font-medium border border-white/10"
                            >
                              <X className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
