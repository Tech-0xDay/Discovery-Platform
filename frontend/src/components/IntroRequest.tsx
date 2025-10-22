import { useState } from 'react';
import { useCreateIntro } from '@/hooks/useIntros';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

interface IntroRequestProps {
  projectId: string;
  builderId: string;
}

export function IntroRequest({ projectId, builderId }: IntroRequestProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const createIntroMutation = useCreateIntro();

  const handleSendIntro = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.id === builderId) {
      alert("You can't send an intro to yourself!");
      return;
    }

    await createIntroMutation.mutateAsync({
      project_id: projectId,
      message: message,
    });

    setMessage('');
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Request Intro
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Introduction</DialogTitle>
          <DialogDescription>
            Connect with the builder behind this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell them why you'd like to connect... (min 10 characters)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createIntroMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendIntro}
              disabled={
                createIntroMutation.isPending ||
                message.trim().length < 10 ||
                message.length > 1000
              }
            >
              {createIntroMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
