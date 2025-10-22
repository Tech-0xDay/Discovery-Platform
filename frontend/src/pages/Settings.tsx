import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Wallet } from 'lucide-react';

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-4xl font-bold">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection</CardTitle>
              <CardDescription>Connect your wallet to verify builder credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-votes" className="flex flex-col space-y-1">
                  <span>Email on votes</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive email when someone votes on your project
                  </span>
                </Label>
                <Switch id="email-votes" />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="email-comments" className="flex flex-col space-y-1">
                  <span>Email on comments</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive email when someone comments on your project
                  </span>
                </Label>
                <Switch id="email-comments" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="email-intros" className="flex flex-col space-y-1">
                  <span>Email on intro requests</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Receive email when someone requests an introduction
                  </span>
                </Label>
                <Switch id="email-intros" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control your profile visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public-profile" className="flex flex-col space-y-1">
                  <span>Public profile</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Make your profile visible to everyone
                  </span>
                </Label>
                <Switch id="public-profile" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="show-email" className="flex flex-col space-y-1">
                  <span>Show email on profile</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    Display your email address on your public profile
                  </span>
                </Label>
                <Switch id="show-email" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
