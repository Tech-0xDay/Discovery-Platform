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
import { X } from 'lucide-react';
import { toast } from 'sonner';

export default function Publish() {
  const navigate = useNavigate();
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState('');

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

  const onSubmit = async (data: PublishProjectInput) => {
    if (techStack.length === 0) {
      toast.error('Please add at least one technology');
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

      console.log('Submitting payload:', payload);
      await createProjectMutation.mutateAsync(payload);
      toast.success('Project published successfully!');
      reset();
      setTechStack([]);
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
        <div className="mx-auto max-w-3xl">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <h1 className="mb-2 text-4xl font-black text-foreground">Publish Your Project</h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Share your incredible hackathon project with our community. Get discovered, receive feedback, and connect with other builders.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div className="card-elevated p-6">
                <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                  Basic Information
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., DeFi Lending Platform"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline (Optional)</Label>
                  <Input
                    id="tagline"
                    placeholder="A brief one-liner description"
                    maxLength={300}
                    {...register('tagline')}
                  />
                  {errors.tagline && (
                    <p className="text-sm text-destructive">{errors.tagline.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project in detail (minimum 50 characters)"
                    rows={8}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimum 50 characters required</p>
                </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                  Hackathon Details (Optional)
                </h2>
                <div className="space-y-4">
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
                    />
                    {errors.hackathonDate && (
                      <p className="text-sm text-destructive">{errors.hackathonDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                  Links & Resources
                </h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="demoUrl">Demo URL</Label>
                    <Input
                      id="demoUrl"
                      type="url"
                      placeholder="https://demo.example.com"
                      {...register('demoUrl')}
                    />
                    {errors.demoUrl && (
                      <p className="text-sm text-destructive">{errors.demoUrl.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      type="url"
                      placeholder="https://github.com/username/repo"
                      {...register('githubUrl')}
                    />
                    {errors.githubUrl && (
                      <p className="text-sm text-destructive">{errors.githubUrl.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                  Tech Stack
                </h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add technology (e.g., React, Solidity)"
                      value={techInput}
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                    />
                    <button type="button" onClick={handleAddTech} className="btn-secondary px-4 py-2">
                      Add
                    </button>
                  </div>

                  {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {techStack.map((tech) => (
                        <span key={tech} className="badge-primary gap-1 flex items-center">
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="ml-1 rounded-full hover:opacity-80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {techStack.length === 0 && (
                    <p className="text-sm font-bold text-destructive">Add at least one technology</p>
                  )}
                </div>
              </div>

              <div className="card-elevated p-6">
                <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                  Screenshots
                </h2>
                <div className="space-y-4">
                  <div className="flex h-32 items-center justify-center rounded-lg border-4 border-black border-dashed bg-secondary/20">
                    <p className="text-sm font-bold text-muted-foreground">Image upload functionality coming soon</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 border-t-4 border-primary pt-6">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isSubmitting || createProjectMutation.isPending}
                >
                  {isSubmitting || createProjectMutation.isPending ? 'Publishing...' : 'Publish Project'}
                </button>
                <button type="button" className="btn-secondary flex-1" onClick={() => navigate(-1)}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
