import { useUpvote, useDownvote, useRemoveVote } from '@/hooks/useVotes';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface VoteButtonsProps {
  projectId: string;
  voteCount: number;
  userVote?: number;
  onVoteChange?: () => void;
}

export function VoteButtons({ projectId, voteCount, userVote = 0, onVoteChange }: VoteButtonsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const upvoteMutation = useUpvote(projectId);
  const downvoteMutation = useDownvote(projectId);
  const removeVoteMutation = useRemoveVote(projectId);

  const handleUpvote = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (userVote === 1) {
      removeVoteMutation.mutate();
    } else {
      upvoteMutation.mutate();
    }
    onVoteChange?.();
  };

  const handleDownvote = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (userVote === -1) {
      removeVoteMutation.mutate();
    } else {
      downvoteMutation.mutate();
    }
    onVoteChange?.();
  };

  const isLoading = upvoteMutation.isPending || downvoteMutation.isPending || removeVoteMutation.isPending;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 p-3">
      <Button
        variant={userVote === 1 ? 'default' : 'ghost'}
        size="sm"
        onClick={handleUpvote}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>

      <span className="min-w-[3rem] text-center font-semibold">
        {voteCount}
      </span>

      <Button
        variant={userVote === -1 ? 'default' : 'ghost'}
        size="sm"
        onClick={handleDownvote}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
