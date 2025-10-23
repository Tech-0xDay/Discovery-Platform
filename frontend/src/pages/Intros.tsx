import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

const mockIntros = [
  {
    id: '1',
    fromUser: { username: 'bob_builder', avatar: '' },
    project: { title: 'DeFi Lending Platform' },
    message: "Hi! I'd love to chat about your DeFi project. I'm working on something similar.",
    status: 'pending' as const,
    createdAt: '2024-03-20',
  },
  {
    id: '2',
    fromUser: { username: 'charlie_crypto', avatar: '' },
    project: { title: 'NFT Marketplace' },
    message: 'Interested in collaborating on the music NFT space!',
    status: 'pending' as const,
    createdAt: '2024-03-19',
  },
];

export default function Intros() {
  const [tab, setTab] = useState<'received' | 'sent'>('received');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Intro Requests</h1>
        <p className="text-muted-foreground">Manage your introduction requests</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'received' | 'sent')}>
        <TabsList className="mb-6">
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {mockIntros.map((intro) => (
            <Card key={intro.id} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={intro.fromUser.avatar} alt={intro.fromUser.username} />
                    <AvatarFallback className="bg-card">
                      {intro.fromUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{intro.fromUser.username}</p>
                    <p className="text-sm text-muted-foreground">
                      wants to connect about "{intro.project.title}"
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{intro.status}</Badge>
              </div>

              <div className="mb-4 rounded-lg bg-secondary/50 p-4">
                <p className="text-sm">{intro.message}</p>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  <Check className="mr-2 h-4 w-4" />
                  Accept
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <X className="mr-2 h-4 w-4" />
                  Decline
                </Button>
              </div>
            </Card>
          ))}

          {mockIntros.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">No intro requests received yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">No intro requests sent yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
