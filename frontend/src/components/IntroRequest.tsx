import { useState } from 'react';
import { useCreateIntro } from '@/hooks/useIntros';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send } from 'lucide-react';

// Helper function to get the backend URL
const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

interface IntroRequestProps {
  projectId: string;
  builderId: string;
}

export function IntroRequest({ projectId, builderId }: IntroRequestProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Only show for investors
  if (!user?.is_investor) {
    return null;
  }

  // Don't show for own projects
  if (user.id === builderId) {
    return null;
  }

  const handleSendIntro = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/intro-requests/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          message: message,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessage('');
        setIsOpen(false);
        toast.success('Intro request sent successfully!');
      } else {
        toast.error(data.message || 'Failed to send intro request');
      }
    } catch (error) {
      toast.error('Failed to send intro request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="btn-primary gap-2 inline-flex items-center w-full group hover:scale-[1.02] transition-transform">
          <Send className="h-4 w-4 group-hover:rotate-12 transition-transform" />
          <span className="font-bold">Request Intro</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <div className="h-10 w-10 rounded-[12px] bg-primary/20 flex items-center justify-center border-2 border-primary">
              <Send className="h-5 w-5 text-primary" />
            </div>
            Request Introduction
          </DialogTitle>
          <DialogDescription className="text-base">
            Introduce yourself and let the builder know why you'd like to connect
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="space-y-3">
            <Label htmlFor="message" className="text-sm font-bold flex items-center justify-between">
              <span>Your Message</span>
              <span className={`text-xs font-semibold transition-colors ${message.length >= 10 && message.length <= 1000 ? 'text-primary' : 'text-muted-foreground'}`}>
                {message.length}/1000
              </span>
            </Label>
            <Textarea
              id="message"
              placeholder="Hi! I'm interested in learning more about your project. I think there might be some interesting opportunities to collaborate..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="resize-none border-2 focus:border-primary"
            />
            {message.trim().length > 0 && message.trim().length < 10 && (
              <p className="text-xs text-red-600 font-medium">
                Message must be at least 10 characters
              </p>
            )}
          </div>

          <div className="bg-secondary/50 rounded-[12px] p-4 border-2 border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Tip:</strong> Great intro requests are specific about your interest,
              mention what caught your attention, and suggest how you might add value.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="flex-1 font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendIntro}
              disabled={
                loading ||
                message.trim().length < 10 ||
                message.length > 1000
              }
              className="flex-1 btn-primary font-bold gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-pulse">Sending</span>
                  <span className="animate-pulse">...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
