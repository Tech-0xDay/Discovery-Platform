import { useState } from 'react';
import { useAwardBadge } from '@/hooks/useBadges';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Award } from 'lucide-react';

interface BadgeAwarderProps {
  projectId: string;
}

export function BadgeAwarder({ projectId }: BadgeAwarderProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [badgeType, setBadgeType] = useState<'silver' | 'gold' | 'platinum'>('silver');
  const [rationale, setRationale] = useState('');

  const awardMutation = useAwardBadge(projectId);

  const handleAward = async () => {
    await awardMutation.mutateAsync({
      badge_type: badgeType,
      rationale: rationale || undefined,
    });

    setBadgeType('silver');
    setRationale('');
    setIsOpen(false);
  };

  // Only show to admins
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="btn-secondary gap-2 inline-flex items-center">
          <Award className="h-4 w-4" />
          Award Badge
        </button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Award Badge</DialogTitle>
          <DialogDescription>
            Recognize excellent projects with validation badges
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badge-type">Badge Type</Label>
            <Select value={badgeType} onValueChange={(value: any) => setBadgeType(value)}>
              <SelectTrigger id="badge-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="silver">
                  🥈 Silver - 10 points
                </SelectItem>
                <SelectItem value="gold">
                  🥇 Gold - 15 points
                </SelectItem>
                <SelectItem value="platinum">
                  💎 Platinum - 20 points
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rationale">Rationale (optional)</Label>
            <Textarea
              id="rationale"
              placeholder="Why are you awarding this badge?"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={awardMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAward}
              disabled={awardMutation.isPending}
            >
              {awardMutation.isPending ? 'Awarding...' : 'Award Badge'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
