import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Clock, ChevronRight, Search } from 'lucide-react';
import { chatAPI } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants?.find(p => p._id !== p.currentUserId); // Basic logic
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100 font-display">Messages</h1>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-2xl border border-slate-700" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-100 font-display">Messages</h1>
        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-full pl-11 pr-4 py-2.5 text-sm text-slate-200 focus:border-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-700 bg-slate-800/30 backdrop-blur-xl text-center">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2 font-display">No messages yet</h3>
          <p className="text-slate-500">Your conversations with buyers and sellers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => {
            // Find the other participant
            // Note: participants is usually an array, 
            // the logic here assumes the backend returns enough info
            const otherUser = conv.participants?.[0] || { name: 'User' };
            const isUnread = conv.unreadCount > 0;

            return (
              <Link 
                key={conv._id}
                to={`/dashboard/messages/${conv._id}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                  isUnread 
                    ? 'bg-indigo-500/5 border-indigo-500/30 hover:border-indigo-500/50' 
                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 font-bold overflow-hidden">
                    {otherUser.avatar ? (
                      <img src={otherUser.avatar} alt={otherUser.name} className="w-full h-full object-cover" />
                    ) : (
                      otherUser.name.charAt(0)
                    )}
                  </div>
                  {isUnread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 border-2 border-slate-950 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-950">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-bold truncate ${isUnread ? 'text-slate-100' : 'text-slate-300'}`}>
                      {otherUser.name}
                    </h3>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap ml-2">
                      {formatDate(conv.lastMessage?.createdAt || conv.updatedAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${isUnread ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>

                <ChevronRight className="h-5 w-5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Messages;
