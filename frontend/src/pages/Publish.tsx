import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publishProjectSchema, PublishProjectInput } from '@/lib/schemas';
import { useCreateProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle, Loader2, Users, Info, Check, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { WalletVerification } from '@/components/WalletVerification';
import { useAuth } from '@/context/AuthContext';

export default function Publish() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>([]);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);
  const [githubUrlWarning, setGithubUrlWarning] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<{ name: string; role: string }[]>([]);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  const [showProofScoreInfo, setShowProofScoreInfo] = useState(false);

  // NEW: Extended project information
  const [pitchDeckUrl, setPitchDeckUrl] = useState<string>('');
  const [pitchDeckFile, setPitchDeckFile] = useState<File | null>(null);
  const [uploadingPitchDeck, setUploadingPitchDeck] = useState(false);
  const [projectStory, setProjectStory] = useState('');
  const [inspiration, setInspiration] = useState('');
  const [marketComparison, setMarketComparison] = useState('');
  const [noveltyFactor, setNoveltyFactor] = useState('');

  const createProjectMutation = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PublishProjectInput>({
    resolver: zodResolver(publishProjectSchema),
    defaultValues: {
      title: '',
      tagline: '',
      description: '',
      demoUrl: '',
      githubUrl: '',
      hackathonName: '',
      hackathonDate: '',
      techStack: [],
    },
  });

  const handleAddTech = () => {
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()]);
      setTechInput('');
    }
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleAddTeamMember = () => {
    if (memberName.trim()) {
      setTeamMembers([...teamMembers, { name: memberName.trim(), role: memberRole.trim() || 'Team Member' }]);
      setMemberName('');
      setMemberRole('');
    }
  };

  const handleRemoveTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check screenshot limit
    if (screenshotUrls.length >= 5) {
      toast.error('Maximum 5 screenshots allowed');
      e.target.value = '';
      return;
    }

    const file = files[0];

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image file (PNG, JPG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const ipfsUrl = data.data.url;

      setScreenshotUrls([...screenshotUrls, ipfsUrl]);
      setScreenshotFiles([...screenshotFiles, file]);
      toast.success('Screenshot uploaded successfully!');
    } catch (error: any) {
      console.error('Screenshot upload error:', error);
      toast.error('Failed to upload screenshot');
    } finally {
      setUploadingScreenshot(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    setScreenshotUrls(screenshotUrls.filter((_, i) => i !== index));
    setScreenshotFiles(screenshotFiles.filter((_, i) => i !== index));
  };

  const handlePitchDeckUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed for pitch decks');
      return;
    }

    // Validate file size (25MB max)
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setUploadingPitchDeck(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/pitch-deck`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const ipfsUrl = data.data.url;

      setPitchDeckUrl(ipfsUrl);
      setPitchDeckFile(file);
      toast.success('Pitch deck uploaded successfully!');
    } catch (error: any) {
      console.error('Pitch deck upload error:', error);
      toast.error('Failed to upload pitch deck');
    } finally {
      setUploadingPitchDeck(false);
      e.target.value = '';
    }
  };

  const handleRemovePitchDeck = () => {
    setPitchDeckUrl('');
    setPitchDeckFile(null);
  };

  const validateGithubUrl = (url: string): boolean => {
    if (!url || !url.trim()) {
      setGithubUrlWarning('');
      return true; // Optional field
    }

    try {
      const urlObj = new URL(url);

      // Check if it's a GitHub URL
      if (!urlObj.hostname.includes('github.com')) {
        setGithubUrlWarning('⚠️ Must be a valid GitHub URL (e.g., https://github.com/username/repo)');
        return false;
      }

      // Check if URL has proper repo format
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      if (pathParts.length < 2) {
        setGithubUrlWarning('⚠️ GitHub URL should include username and repository (e.g., https://github.com/username/repo)');
        return false;
      }

      // If user has connected GitHub, validate username
      if (user?.github_connected && user?.github_username) {
        const username = user.github_username.toLowerCase();
        const urlUsername = pathParts[0].toLowerCase();

        if (urlUsername !== username) {
          setGithubUrlWarning(`⚠️ GitHub URL should belong to your account (@${user.github_username}). Current URL belongs to @${pathParts[0]}`);
          return false;
        }
      }

      setGithubUrlWarning('✓ Valid GitHub URL');
      return true;
    } catch {
      setGithubUrlWarning('⚠️ Invalid URL format. Please enter a complete URL starting with https://');
      return false;
    }
  };

  const onSubmit = async (data: PublishProjectInput) => {
    if (techStack.length === 0) {
      toast.error('Please add at least one technology');
      return;
    }

    // Validate GitHub URL if provided
    if (data.githubUrl && !validateGithubUrl(data.githubUrl)) {
      toast.error('Please fix the GitHub URL before publishing');
      return;
    }

    try {
      // Convert camelCase to snake_case for backend
      const payload: any = {
        title: data.title,
        description: data.description,
        tech_stack: techStack,
      };

      // Add optional fields only if they have values
      if (data.tagline && data.tagline.trim()) {
        payload.tagline = data.tagline;
      }
      if (data.demoUrl && data.demoUrl.trim()) {
        payload.demo_url = data.demoUrl;
      }
      if (data.githubUrl && data.githubUrl.trim()) {
        payload.github_url = data.githubUrl;
      }
      if (data.hackathonName && data.hackathonName.trim()) {
        payload.hackathon_name = data.hackathonName;
      }
      if (data.hackathonDate && data.hackathonDate.trim()) {
        payload.hackathon_date = data.hackathonDate;
      }
      if (screenshotUrls.length > 0) {
        payload.screenshot_urls = screenshotUrls;
      }
      if (teamMembers.length > 0) {
        payload.team_members = teamMembers;
      }
      // NEW: Add extended project information
      if (projectStory && projectStory.trim()) {
        payload.project_story = projectStory;
      }
      if (inspiration && inspiration.trim()) {
        payload.inspiration = inspiration;
      }
      if (pitchDeckUrl && pitchDeckUrl.trim()) {
        payload.pitch_deck_url = pitchDeckUrl;
      }
      if (marketComparison && marketComparison.trim()) {
        payload.market_comparison = marketComparison;
      }
      if (noveltyFactor && noveltyFactor.trim()) {
        payload.novelty_factor = noveltyFactor;
      }

      console.log('=== SUBMITTING PROJECT ===');
      console.log('GitHub URL from form:', data.githubUrl);
      console.log('Full payload being sent:', JSON.stringify(payload, null, 2));
      console.log('========================');

      await createProjectMutation.mutateAsync(payload);
      toast.success('Project published successfully!');
      reset();
      setTechStack([]);
      setScreenshotUrls([]);
      setTeamMembers([]);
      // NEW: Reset extended fields
      setProjectStory('');
      setInspiration('');
      setPitchDeckUrl('');
      setPitchDeckFile(null);
      setMarketComparison('');
      setNoveltyFactor('');
      navigate('/my-projects');
    } catch (error: any) {
      console.error('Error publishing project:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to publish project';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="mb-2 text-4xl font-black text-foreground">Publish Your Project</h1>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Share your incredible hackathon project with our community. Get discovered, receive feedback, and connect with other builders.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProofScoreInfo(!showProofScoreInfo)}
                className="ml-4 p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition-smooth border-2 border-primary flex-shrink-0"
                title="Learn about Proof Score"
              >
                <Info className="h-6 w-6 text-primary" />
              </button>
            </div>

            {/* Proof Score Info - Collapsible */}
            {showProofScoreInfo && (
              <div className="bg-primary/10 border-4 border-primary rounded-[15px] p-6 mt-6 animate-in slide-in-from-top-2">
                <h2 className="text-lg font-black text-foreground mb-4">Maximize Your Proof Score (0-100)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Quality Score (Max 20 points)</h3>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>✓ Demo URL: +5 points</li>
                      <li>✓ GitHub URL: +5 points</li>
                      <li>✓ Screenshots: +5 points</li>
                      <li>✓ Description (200+ chars): +5 points</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Verification Score (Max 20 points)</h3>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>✓ Email verified: +5 points</li>
                      <li>✓ 0xCert connected: +10 points</li>
                      <li>✓ GitHub connected: +5 points</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Community Score (Max 30 points)</h3>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>✓ Upvote ratio: up to 20 points</li>
                      <li>✓ Comments: up to 10 points</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Validation Score (Max 30 points)</h3>
                    <ul className="space-y-1 text-muted-foreground text-xs">
                      <li>✓ Badges from experts</li>
                      <li>✓ Silver: 10 points</li>
                      <li>✓ Gold: 15 points</li>
                      <li>✓ Platinum: 20 points</li>
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-xs text-foreground font-bold bg-primary/20 p-3 rounded-lg border-2 border-primary">
                  💡 Fill in all optional fields to achieve a maximum Quality Score of 20/20!
                </p>
              </div>
            )}
          </div>

          {/* Wallet & Verification Section */}
          <div className="mb-8">
            <WalletVerification />
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8">
              <div className="card-elevated p-8">
                <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3">
                  Basic Information
                </h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-base font-bold">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., DeFi Lending Platform"
                      className="text-base"
                      {...register('title')}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tagline" className="text-base font-bold">Tagline (Optional)</Label>
                    <Input
                      id="tagline"
                      placeholder="A brief one-liner description"
                      maxLength={300}
                      className="text-base"
                      {...register('tagline')}
                    />
                    {errors.tagline && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {errors.tagline.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-bold">
                      Description *
                      <span className="ml-2 text-xs badge-primary">+5 Quality Score for 200+ chars</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in detail (minimum 200 characters for quality score)"
                      rows={8}
                      className="text-base"
                      {...register('description')}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        {errors.description.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">Minimum 200 characters recommended for +5 quality score</p>
                  </div>
                </div>
              </div>

              {/* NEW: Project Story & Vision Section */}
              <div className="card-elevated p-8 bg-gradient-to-br from-card to-primary/5">
                <h2 className="text-2xl font-black mb-2 text-foreground border-b-4 border-primary pb-3">
                  📖 Project Story & Vision
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Share the journey behind your project - what inspired you and how it came to life</p>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="projectStory" className="text-base font-bold flex items-center gap-2">
                      <span>🚀 The Journey</span>
                      <span className="text-xs badge-secondary">Optional</span>
                    </Label>
                    <Textarea
                      id="projectStory"
                      placeholder="Tell us your project's story... How did this idea come to life? What challenges did you face? What were those breakthrough moments?"
                      rows={5}
                      className="text-base resize-none"
                      value={projectStory}
                      onChange={(e) => setProjectStory(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Help others understand the path you took to build this project</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="inspiration" className="text-base font-bold flex items-center gap-2">
                      <span>💡 The Spark</span>
                      <span className="text-xs badge-secondary">Optional</span>
                    </Label>
                    <Textarea
                      id="inspiration"
                      placeholder="What inspired you to build this? Was it a personal experience, a problem you noticed, or a vision for the future?"
                      rows={4}
                      className="text-base resize-none"
                      value={inspiration}
                      onChange={(e) => setInspiration(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Share the 'why' behind your project</p>
                  </div>
                </div>
              </div>

              {/* NEW: Market & Innovation Section */}
              <div className="card-elevated p-8 bg-gradient-to-br from-card to-accent/5">
                <h2 className="text-2xl font-black mb-2 text-foreground border-b-4 border-primary pb-3">
                  🎯 Market & Innovation
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Show what makes your project stand out in the ecosystem</p>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="marketComparison" className="text-base font-bold flex items-center gap-2">
                      <span>🔍 Competitive Landscape</span>
                      <span className="text-xs badge-secondary">Optional</span>
                    </Label>
                    <Textarea
                      id="marketComparison"
                      placeholder="What other projects or products exist in this space? How does yours differ or improve upon them? What unique approach are you taking?"
                      rows={5}
                      className="text-base resize-none"
                      value={marketComparison}
                      onChange={(e) => setMarketComparison(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Help others see how your project fits in the market</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="noveltyFactor" className="text-base font-bold flex items-center gap-2">
                      <span>✨ What Makes This Special</span>
                      <span className="text-xs badge-secondary">Optional</span>
                    </Label>
                    <Textarea
                      id="noveltyFactor"
                      placeholder="What's the novel or unique aspect of your project? Is it a new technology, an innovative approach, or a fresh perspective on an old problem?"
                      rows={4}
                      className="text-base resize-none"
                      value={noveltyFactor}
                      onChange={(e) => setNoveltyFactor(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Highlight your project's innovation factor</p>
                  </div>
                </div>
              </div>

              {/* NEW: Pitch Deck Section */}
              <div className="card-elevated p-8 bg-gradient-to-br from-card to-secondary/10">
                <h2 className="text-2xl font-black mb-2 text-foreground border-b-4 border-primary pb-3">
                  📊 Pitch Deck
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Upload your pitch deck to give investors and collaborators a complete view</p>

                <div className="space-y-4">
                  {!pitchDeckUrl ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-secondary/20 hover:bg-secondary/30 transition-smooth">
                      <input
                        type="file"
                        id="pitchDeck"
                        accept=".pdf"
                        onChange={handlePitchDeckUpload}
                        className="hidden"
                        disabled={uploadingPitchDeck}
                      />
                      <label
                        htmlFor="pitchDeck"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        {uploadingPitchDeck ? (
                          <>
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-sm font-bold text-foreground">Uploading to IPFS...</p>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-primary/20 rounded-full">
                              <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                              <p className="text-base font-bold text-foreground mb-1">Upload Pitch Deck (PDF)</p>
                              <p className="text-xs text-muted-foreground">Max 25MB • Stored on IPFS</p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="border-2 border-primary rounded-lg p-6 bg-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary rounded-lg">
                            <FileText className="h-6 w-6 text-black" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{pitchDeckFile?.name || 'Pitch Deck'}</p>
                            <p className="text-xs text-muted-foreground">
                              {pitchDeckFile ? `${(pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePitchDeck}
                          className="p-2 hover:bg-destructive/20 rounded-lg transition-smooth"
                          title="Remove pitch deck"
                        >
                          <X className="h-5 w-5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    💡 A good pitch deck can significantly increase investor interest and collaboration opportunities
                  </p>
                </div>
              </div>

              <div className="card-elevated p-8">
                <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3">
                  Hackathon Details (Optional)
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="hackathonName">Hackathon Name</Label>
                    <Input
                      id="hackathonName"
                      placeholder="e.g., ETH Global London"
                      {...register('hackathonName')}
                    />
                    {errors.hackathonName && (
                      <p className="text-sm text-destructive">{errors.hackathonName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hackathonDate">Hackathon Date</Label>
                    <Input
                      id="hackathonDate"
                      type="date"
                      {...register('hackathonDate')}
                      style={{
                        colorScheme: 'dark'
                      }}
                      className="[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-100 [&::-webkit-calendar-picker-indicator]:opacity-100"
                    />
                    {errors.hackathonDate && (
                      <p className="text-sm text-destructive">{errors.hackathonDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-elevated p-8">
                <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3">
                  Links & Resources
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">
                      Demo URL
                      <span className="ml-2 text-xs badge-primary">+5 Quality Score</span>
                    </Label>
                    <Input
                      id="demoUrl"
                      type="url"
                      placeholder="https://demo.example.com"
                      {...register('demoUrl')}
                    />
                    {errors.demoUrl && (
                      <p className="text-sm text-destructive">{errors.demoUrl.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Add a working demo to earn +5 quality score</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">
                      GitHub URL
                      <span className="ml-2 text-xs badge-primary">+5 Quality Score</span>
                    </Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      placeholder="https://github.com/username/repo"
                      {...register('githubUrl', {
                        onChange: (e) => validateGithubUrl(e.target.value),
                        onBlur: (e) => validateGithubUrl(e.target.value)
                      })}
                    />
                    {errors.githubUrl && (
                      <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
                    )}
                    {githubUrlWarning && (
                      <div className={`flex items-start gap-2 p-2 rounded-md transition-all duration-200 ${
                        githubUrlWarning.startsWith('✓')
                          ? 'bg-primary border border-primary/80 hover:bg-primary/90 hover:border-primary'
                          : 'bg-primary border border-primary/80 hover:bg-primary/90'
                      }`}>
                        {githubUrlWarning.startsWith('✓') ? (
                          <Check className="h-4 w-4 text-black mt-0.5 flex-shrink-0 font-bold stroke-2" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-black mt-0.5 flex-shrink-0 font-bold stroke-2" />
                        )}
                        <p className={`text-xs font-semibold text-black`}>{githubUrlWarning}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Link your repository to earn +5 quality score
                      {user?.github_connected && (
                        <span className="text-primary font-medium"> (Connected as @{user.github_username})</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-elevated p-8">
                <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3">
                  Tech Stack *
                </h2>
                <div className="space-y-5">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Add technology (e.g., React, Solidity)"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                      className="text-base"
                    />
                    <button type="button" onClick={handleAddTech} className="btn-secondary px-6 py-2 font-bold">
                      Add
                    </button>
                  </div>

                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-3">
                      {techStack.map((tech) => (
                        <span key={tech} className="badge-primary gap-2 flex items-center text-sm px-4 py-2">
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="rounded-full hover:opacity-80 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {techStack.length === 0 && (
                    <p className="text-sm font-bold text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Add at least one technology
                    </p>
                  )}
                </div>
              </div>

              {/* Team Members Section */}
              <div className="card-elevated p-8">
                <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3 flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Team Members / Crew (Optional)
                </h2>
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Add your team members or collaborators who worked on this project. This will be displayed on project cards and details.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bold">Name *</Label>
                      <Input
                        placeholder="Team member name"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeamMember())}
                        className="text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Role (optional)</Label>
                      <Input
                        placeholder="e.g., Frontend Dev, Designer"
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTeamMember())}
                        className="text-base"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddTeamMember}
                    className="btn-secondary px-6 py-2 font-bold"
                    disabled={!memberName.trim()}
                  >
                    Add Team Member
                  </button>

                  {teamMembers.length > 0 && (
                    <div className="space-y-3">
                      {teamMembers.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border-2 border-border hover:border-primary/30 transition-smooth"
                        >
                          <div>
                            <p className="font-bold text-foreground text-base">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.role}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeamMember(index)}
                            className="p-2 hover:bg-destructive/20 rounded-full transition-smooth"
                          >
                            <X className="h-5 w-5 text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card-elevated p-8">
                <h2 className="text-2xl font-black mb-6 text-foreground border-b-4 border-primary pb-3">
                  Screenshots (Optional)
                  <span className="ml-2 text-xs badge-primary">+5 Quality Score</span>
                </h2>
                <div className="space-y-5">
                  <p className="text-sm text-muted-foreground">
                    Upload screenshots to increase your project's quality score. At least one screenshot earns +5 points.
                    Images are stored on IPFS via Pinata.
                  </p>

                  {/* File Upload Button */}
                  <div>
                    <label
                      htmlFor="screenshot-upload"
                      className={`inline-flex items-center gap-2 px-4 py-2 ${
                        uploadingScreenshot || screenshotUrls.length >= 5
                          ? 'btn-secondary opacity-50 cursor-not-allowed'
                          : 'btn-primary cursor-pointer'
                      }`}
                    >
                      {uploadingScreenshot ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : screenshotUrls.length >= 5 ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Limit Reached (5/5)
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Upload Screenshot ({screenshotUrls.length}/5)
                        </>
                      )}
                    </label>
                    <input
                      id="screenshot-upload"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                      onChange={handleScreenshotUpload}
                      disabled={uploadingScreenshot || screenshotUrls.length >= 5}
                      className="hidden"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported: PNG, JPG, GIF, WebP • Max size: 10MB • Max 5 screenshots
                    </p>
                  </div>

                  {/* Uploaded Screenshots */}
                  {screenshotUrls.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {screenshotUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-56 object-cover rounded-lg border-4 border-border group-hover:border-primary/50 transition-smooth"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveScreenshot(index)}
                            className="absolute top-3 right-3 bg-destructive text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-smooth hover:scale-110"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <span className="absolute bottom-3 left-3 bg-black/80 text-white text-sm font-bold px-3 py-1.5 rounded-md">
                            Screenshot {index + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {screenshotUrls.length === 0 && (
                    <div className="flex flex-col h-32 items-center justify-center rounded-lg border-4 border-black border-dashed bg-secondary/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-bold text-muted-foreground">No screenshots uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="card-elevated p-8 mt-8">
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="btn-primary flex-1 py-4 text-lg font-black"
                    disabled={isSubmitting || createProjectMutation.isPending}
                  >
                    {isSubmitting || createProjectMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Publishing...
                      </span>
                    ) : (
                      'Publish Project'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary flex-1 py-4 text-lg font-bold"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting || createProjectMutation.isPending}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
