import { useVote } from '@/hooks/useVotes';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

interface VoteButtonsProps {
  projectId: string;
  voteCount: number;
  userVote?: 'up' | 'down' | null;
  onVoteChange?: () => void;
}

export function VoteButtons({ projectId, voteCount, userVote = null, onVoteChange }: VoteButtonsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const voteMutation = useVote(projectId);
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(userVote);
  const [currentCount, setCurrentCount] = useState(voteCount);
  const isProcessing = useRef(false);

  useEffect(() => {
    setCurrentVote(userVote);
    setCurrentCount(voteCount);
  }, [userVote, voteCount]);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Prevent double-clicks
    if (isProcessing.current || voteMutation.isPending) {
      return;
    }

    isProcessing.current = true;
    const wasVoted = currentVote === voteType;
    const previousVote = currentVote;
    const previousCount = currentCount;

    // Optimistic update
    if (wasVoted) {
      // Remove vote (toggle off)
      setCurrentVote(null);
      setCurrentCount(prev => voteType === 'up' ? prev - 1 : prev + 1);
    } else if (currentVote) {
      // Change vote from opposite type
      setCurrentVote(voteType);
      setCurrentCount(prev => {
        if (currentVote === 'up' && voteType === 'down') return prev - 2;
        if (currentVote === 'down' && voteType === 'up') return prev + 2;
        return prev;
      });
    } else {
      // New vote
      setCurrentVote(voteType);
      setCurrentCount(prev => voteType === 'up' ? prev + 1 : prev - 1);
    }

    // Make API call
    voteMutation.mutate(voteType, {
      onError: () => {
        // Revert on error
        setCurrentVote(previousVote);
        setCurrentCount(previousCount);
        isProcessing.current = false;
      },
      onSuccess: (response) => {
        // Sync with backend response
        const data = response?.data?.data;
        if (data) {
          const newCount = (data.upvotes || 0) - (data.downvotes || 0);
          setCurrentCount(newCount);
          setCurrentVote(data.user_vote || null);
        } else {
          // Vote was removed (backend returns null)
          setCurrentVote(null);
        }
        isProcessing.current = false;
        onVoteChange?.();
      },
      onSettled: () => {
        isProcessing.current = false;
      },
    });
  };

  const isLoading = voteMutation.isPending || isProcessing.current;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3">
      <Button
        variant={currentVote === 'up' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleVote('up')}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>

      <span className="min-w-[3rem] text-center font-semibold">
        {currentCount}
      </span>

      <Button
        variant={currentVote === 'down' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleVote('down')}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
