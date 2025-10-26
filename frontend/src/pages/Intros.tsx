import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader2, Mail, Clock, CheckCircle, XCircle, Send, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Helper function to get the backend URL
const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

interface IntroRequest {
  id: string;
  project_id: string;
  investor_id: string;
  builder_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  project?: {
    id: string;
    title: string;
    tagline: string;
  };
  investor?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
  builder?: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export default function Intros() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<IntroRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<IntroRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceivedRequests();
    if (user?.is_investor) {
      fetchSentRequests();
    }
  }, [user]);

  const fetchReceivedRequests = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/intro-requests/received`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setReceivedRequests(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/intro-requests/sent`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setSentRequests(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/intro-requests/${requestId}/accept`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Intro request accepted!');
        fetchReceivedRequests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/intro-requests/${requestId}/decline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast.success('Intro request declined');
        fetchReceivedRequests();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to decline request');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-primary" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-primary border-primary text-black font-semibold hover:bg-primary/90 transition-colors';
      case 'accepted':
        return 'bg-primary border-primary text-black font-semibold hover:bg-primary/90 transition-colors';
      case 'declined':
        return 'bg-red-400/20 border-red-500 text-red-700 hover:bg-red-400/30 hover:border-red-600 transition-colors';
      default:
        return 'bg-secondary border-border hover:border-primary/50 transition-colors';
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
    <div className="min-h-screen bg-background pt-20 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="badge-primary flex items-center justify-center h-12 w-12 flex-shrink-0 rounded-[15px]">
              <Mail className="h-6 w-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">Intro Requests</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {user?.is_investor
                  ? 'Connect with talented builders and discover new opportunities'
                  : 'Review introduction requests from investors interested in your work'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs - Only show for investors */}
        {user?.is_investor ? (
          <div className="mb-8 card-elevated inline-flex p-1.5 gap-1">
            <button
              onClick={() => setTab('received')}
              className={`px-6 py-2.5 font-bold rounded-[12px] transition-all flex items-center gap-2 ${
                tab === 'received'
                  ? 'bg-primary text-foreground shadow-lg scale-105'
                  : 'hover:bg-secondary/50'
              }`}
            >
              <Mail className="h-4 w-4" />
              Received
              {receivedRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-foreground/20 rounded-full text-xs">
                  {receivedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('sent')}
              className={`px-6 py-2.5 font-bold rounded-[12px] transition-all flex items-center gap-2 ${
                tab === 'sent'
                  ? 'bg-primary text-foreground shadow-lg scale-105'
                  : 'hover:bg-secondary/50'
              }`}
            >
              <Send className="h-4 w-4" />
              Sent
              {sentRequests.length > 0 && (
                <span className="px-2 py-0.5 bg-foreground/20 rounded-full text-xs">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </div>
        ) : null}

        {/* Received Requests */}
        {(!user?.is_investor || tab === 'received') && (
          <div className="space-y-4">
            {receivedRequests.length === 0 ? (
              <div className="card-elevated p-12 text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                <p className="text-xl font-bold mb-2">No intro requests</p>
                <p className="text-muted-foreground">
                  {user?.is_investor
                    ? 'Builders you requested intros with will appear here'
                    : 'Investors interested in your projects will appear here'}
                </p>
              </div>
            ) : (
              receivedRequests.map((intro) => (
                <div key={intro.id} className="card-elevated p-6 hover:shadow-2xl transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-14 w-14 rounded-[15px] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-black text-primary text-xl border-2 border-primary/50 group-hover:scale-110 transition-transform">
                        {intro.investor?.username[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg mb-1">
                          {intro.investor?.display_name || intro.investor?.username}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">@{intro.investor?.username}</p>
                        {intro.project && (
                          <button
                            onClick={() => navigate(`/project/${intro.project?.id}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-[8px] border border-primary/30 hover:border-primary/60 transition-all"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            "{intro.project.title}"
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-[10px] border-2 flex items-center gap-2 font-black text-xs ${getStatusBadgeClass(intro.status)} shadow-sm`}>
                      {getStatusIcon(intro.status)}
                      <span className="uppercase tracking-wide">{intro.status}</span>
                    </div>
                  </div>

                  {intro.message && (
                    <div className="mb-4 p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-[15px] border-2 border-border group-hover:border-primary/30 transition-colors">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Their Message:</p>
                      <p className="text-sm leading-relaxed">{intro.message}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 pb-4 border-b border-border">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{new Date(intro.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {intro.status === 'pending' && (
                    <div className="flex gap-3">
                      <button onClick={() => handleAccept(intro.id)} className="btn-primary flex-1 gap-2 group/btn hover:scale-105 transition-transform">
                        <Check className="h-4 w-4 group-hover/btn:scale-125 transition-transform" />
                        <span className="font-bold">Accept & Start Chat</span>
                      </button>
                      <button onClick={() => handleDecline(intro.id)} className="btn-secondary flex-1 gap-2 hover:scale-105 transition-transform">
                        <X className="h-4 w-4" />
                        <span className="font-bold">Decline</span>
                      </button>
                    </div>
                  )}

                  {intro.status === 'accepted' && (
                    <button
                      onClick={() => navigate(`/messages?user=${intro.investor?.id}`)}
                      className="btn-primary w-full gap-2 group/btn hover:scale-[1.02] transition-transform"
                    >
                      <Mail className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                      <span className="font-bold">Open Conversation</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Sent Requests (Investors Only) */}
        {user?.is_investor && tab === 'sent' && (
          <div className="space-y-4">
            {sentRequests.length === 0 ? (
              <div className="card-elevated p-12 text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                <p className="text-xl font-bold mb-2">No sent requests</p>
                <p className="text-muted-foreground">
                  Request intros to projects you're interested in
                </p>
              </div>
            ) : (
              sentRequests.map((intro) => (
                <div key={intro.id} className="card-elevated p-6 hover:shadow-2xl transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-14 w-14 rounded-[15px] bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-black text-primary text-xl border-2 border-primary/50 group-hover:scale-110 transition-transform">
                        {intro.builder?.username[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-lg mb-1">
                          {intro.builder?.display_name || intro.builder?.username}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">@{intro.builder?.username}</p>
                        {intro.project && (
                          <button
                            onClick={() => navigate(`/project/${intro.project?.id}`)}
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-[8px] border border-primary/30 hover:border-primary/60 transition-all"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            "{intro.project.title}"
                          </button>
                        )}
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-[10px] border-2 flex items-center gap-2 font-black text-xs ${getStatusBadgeClass(intro.status)} shadow-sm`}>
                      {getStatusIcon(intro.status)}
                      <span className="uppercase tracking-wide">{intro.status}</span>
                    </div>
                  </div>

                  {intro.message && (
                    <div className="mb-4 p-5 bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-[15px] border-2 border-border group-hover:border-primary/30 transition-colors">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Your Message:</p>
                      <p className="text-sm leading-relaxed">{intro.message}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{new Date(intro.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {intro.status === 'accepted' && (
                    <button
                      onClick={() => navigate(`/messages?user=${intro.builder?.id}`)}
                      className="btn-primary w-full gap-2 group/btn hover:scale-[1.02] transition-transform"
                    >
                      <Mail className="h-4 w-4 group-hover/btn:rotate-12 transition-transform" />
                      <span className="font-bold">Open Conversation</span>
                    </button>
                  )}

                  {intro.status === 'pending' && (
                    <div className="bg-primary border-2 border-primary rounded-[12px] p-4 flex items-center gap-3">
                      <Clock className="h-5 w-5 text-black animate-spin" />
                      <p className="text-sm font-semibold text-black">
                        Waiting for builder to respond
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
