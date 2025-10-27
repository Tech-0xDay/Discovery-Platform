import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { usersService, uploadService } from '@/services/api';
import { Loader2, Upload, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    display_name: user?.displayName || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar || '',
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => usersService.update(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      await refreshUser();
      toast.success('Profile updated successfully!');
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      toast.error(errorMessage);
    },
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(user?.avatar || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    try {
      let avatarUrl = formData.avatar_url;

      // Upload avatar to IPFS if a new file is selected
      if (avatarFile) {
        setUploadingAvatar(true);
        try {
          const uploadResponse = await uploadService.upload(avatarFile);
          avatarUrl = uploadResponse.data.data.url;
          toast.success('Avatar uploaded to IPFS!');
        } catch (uploadError: any) {
          console.error('Avatar upload error:', uploadError);
          toast.error(uploadError.response?.data?.message || 'Failed to upload avatar');
          setUploadingAvatar(false);
          return;
        }
        setUploadingAvatar(false);
      }

      // Update profile with new data
      const updateData = {
        display_name: formData.display_name,
        bio: formData.bio,
        avatar_url: avatarUrl,
      };

      updateProfileMutation.mutate(updateData);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save profile');
    }
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
              {/* Avatar Upload */}
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary">
                    <AvatarImage src={avatarPreview} alt={user?.username} />
                    <AvatarFallback className="text-2xl font-black bg-primary text-black">
                      {user?.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary inline-flex items-center gap-2 px-4 py-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </button>
                      {avatarFile && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="btn-secondary inline-flex items-center gap-2 px-4 py-2 text-destructive"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload an image (PNG, JPG, GIF, WebP). Max 10MB. Will be stored on IPFS.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={user?.username} disabled className="bg-secondary/50" />
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user?.email} disabled className="bg-secondary/50" />
                <p className="text-xs text-muted-foreground">Email cannot be changed from profile</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  placeholder="Your full name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself... what are you passionate about?"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={5}
                  className="resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={updateProfileMutation.isPending || uploadingAvatar}
                className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2"
              >
                {(updateProfileMutation.isPending || uploadingAvatar) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploadingAvatar ? 'Uploading avatar...' : 'Saving...'}
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
