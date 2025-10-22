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
      await createProjectMutation.mutateAsync({
        ...data,
        techStack,
      });
      reset();
      setTechStack([]);
      navigate('/my-projects');
    } catch (error) {
      toast.error('Failed to publish project');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Publish Project</h1>
          <p className="text-muted-foreground">Share your hackathon project with the community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Tell us about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Label htmlFor="tagline">Tagline *</Label>
                  <Input
                    id="tagline"
                    placeholder="A brief one-liner description"
                    maxLength={100}
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
                    placeholder="Describe your project in detail (minimum 200 characters)"
                    rows={8}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Minimum 200 characters required</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hackathon Details</CardTitle>
                <CardDescription>When and where was this built?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hackathonName">Hackathon Name *</Label>
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
                  <Label htmlFor="hackathonDate">Hackathon Date *</Label>
                  <Input
                    id="hackathonDate"
                    type="date"
                    {...register('hackathonDate')}
                  />
                  {errors.hackathonDate && (
                    <p className="text-sm text-destructive">{errors.hackathonDate.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links & Resources</CardTitle>
                <CardDescription>Help others explore your work</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tech Stack</CardTitle>
                <CardDescription>What technologies did you use?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add technology (e.g., React, Solidity)"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                  />
                  <Button type="button" onClick={handleAddTech} variant="outline">
                    Add
                  </Button>
                </div>

                {techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {techStack.map((tech) => (
                      <Badge key={tech} variant="secondary" className="gap-1">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(tech)}
                          className="ml-1 rounded-full hover:bg-background/50"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {techStack.length === 0 && (
                  <p className="text-sm text-destructive">Add at least one technology</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Screenshots</CardTitle>
                <CardDescription>Upload up to 5 screenshots (coming soon)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/20">
                  <p className="text-muted-foreground">Image upload functionality coming soon</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || createProjectMutation.isPending}
              >
                {isSubmitting || createProjectMutation.isPending ? 'Publishing...' : 'Publish Project'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
