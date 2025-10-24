import { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Helper function to get the backend URL
const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

interface User {
  id: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  recipient?: User;
}

interface Conversation {
  user: User;
  last_message: Message | null;
  unread_count: number;
}

export default function DirectMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessagesWithUser(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchConversations = async () => {
    try {
      console.log('🔍 DirectMessages: Fetching conversations...');
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      console.log('📨 DirectMessages: Conversations response:', data);
      if (data.status === 'success') {
        console.log('✅ DirectMessages: Setting conversations:', data.data);
        setConversations(data.data);
      } else {
        console.error('❌ DirectMessages: Failed to fetch conversations:', data);
      }
    } catch (error) {
      console.error('❌ DirectMessages: Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesWithUser = async (userId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/messages/conversation/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recipient_id: selectedUser.id,
          message: newMessage,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessages([...messages, data.data]);
        setNewMessage('');
        fetchConversations(); // Refresh conversation list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start gap-4">
          <div className="badge-primary flex items-center justify-center h-12 w-12 flex-shrink-0 rounded-[15px]">
            <MessageSquare className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black mb-2">Direct Messages</h1>
            <p className="text-muted-foreground text-sm">
              Continue conversations with builders and investors
            </p>
          </div>
        </div>

        <div className="card-elevated overflow-hidden flex rounded-[20px]" style={{ height: 'calc(100vh - 250px)' }}>
          {/* Conversations List */}
          <div className={`w-full md:w-1/3 border-r-4 border-black overflow-y-auto ${selectedUser ? 'hidden md:block' : ''}`}>
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.user.id}
                  onClick={() => setSelectedUser(conv.user)}
                  className={`w-full p-5 flex items-start gap-3 hover:bg-secondary/70 transition-all text-left border-b-2 border-border group ${
                    selectedUser?.id === conv.user.id ? 'bg-gradient-to-r from-primary/20 to-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className={`h-14 w-14 rounded-[15px] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center flex-shrink-0 font-black text-primary text-lg border-2 border-primary/50 ${selectedUser?.id === conv.user.id ? 'scale-110' : 'group-hover:scale-105'} transition-transform`}>
                    {conv.user.username[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="font-bold text-base truncate">{conv.user.display_name || conv.user.username}</p>
                      {conv.unread_count > 0 && (
                        <span className="px-2.5 py-1 bg-primary text-foreground text-xs font-black rounded-full shadow-sm animate-pulse">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-muted-foreground truncate leading-relaxed">
                        {conv.last_message.sender_id === user?.id ? <span className="font-semibold">You: </span> : ''}
                        {conv.last_message.message}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Messages View */}
          <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : ''}`}>
            {!selectedUser ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-5 border-b-4 border-black flex items-center gap-4 bg-gradient-to-r from-secondary/30 to-background">
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="md:hidden btn-secondary p-2 hover:scale-110 transition-transform"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-12 w-12 rounded-[15px] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-black text-primary text-lg border-2 border-primary/50">
                    {selectedUser.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-lg">{selectedUser.display_name || selectedUser.username}</p>
                    <p className="text-sm text-muted-foreground font-medium">@{selectedUser.username}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-secondary/10">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-3 text-primary/50" />
                        <p className="text-sm text-muted-foreground font-medium">
                          Start the conversation! Say hi 👋
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                          <div
                            className={`max-w-[75%] p-4 rounded-[15px] border-2 shadow-sm ${
                              isOwn
                                ? 'bg-primary text-foreground border-primary/50'
                                : 'bg-card border-border'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.message}</p>
                            <p className={`text-xs mt-2 font-medium ${isOwn ? 'text-foreground/70' : 'text-muted-foreground'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Input */}
                <div className="p-5 border-t-4 border-black bg-secondary/20">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Type your message..."
                      className="input-primary flex-1 py-3 px-4 text-sm border-2 focus:border-primary"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="btn-primary px-6 group hover:scale-105 transition-transform disabled:hover:scale-100"
                    >
                      {sending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
