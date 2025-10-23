import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();

  const handleSave = () => {
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 card-elevated p-8">
            <h1 className="text-4xl font-black text-foreground mb-2">Edit Profile</h1>
            <p className="text-base text-muted-foreground">
              Update your profile information and customize your public profile
            </p>
          </div>

          {/* Profile Form */}
          <div className="card-elevated p-8">
            <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3">
              Profile Information
            </h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={user?.username} disabled className="bg-secondary/50" />
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" defaultValue={user?.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" defaultValue={user?.displayName} placeholder="Your full name" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself... what are you passionate about?"
                  defaultValue={user?.bio}
                  rows={5}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">Maximum 500 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  defaultValue={user?.avatar}
                />
              </div>

              <button onClick={handleSave} className="btn-primary w-full py-3">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
