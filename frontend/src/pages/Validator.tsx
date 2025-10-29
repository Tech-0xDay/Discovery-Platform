import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Loader2, ExternalLink, Github, Calendar, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  demo_url?: string;
  github_url?: string;
  hackathon_name?: string;
  hackathon_date?: string;
  creator?: {
    username: string;
    avatar?: string;
  };
  badges?: Array<{
    badge_type: string;
    rationale: string;
    awarded_by: {
      username: string;
    };
    awarded_at: string;
  }>;
  proof_score?: number;
  validation_score?: number;
  created_at: string;
}

interface ValidatorPermissions {
  can_validate_all: boolean;
  allowed_badge_types: string[];
  allowed_project_ids: string[];
}

export default function Validator() {
  const { user, token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [permissions, setPermissions] = useState<ValidatorPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [badgeType, setBadgeType] = useState<string>('silver');
  const [rationale, setRationale] = useState('');
  const [isAwarding, setIsAwarding] = useState(false);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'validated'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    if (user && token) {
      fetchPermissions();
      fetchProjects();
    }
  }, [user, token, filterTab]);

  const fetchPermissions = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/validator/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setPermissions(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const backendUrl = getBackendUrl();
      const validated = filterTab === 'pending' ? 'false' : filterTab === 'validated' ? 'true' : 'all';
      const response = await fetch(`${backendUrl}/api/validator/projects?validated=${validated}&per_page=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.status === 'success') {
        const projectsArray = data.data?.projects || [];
        setProjects(projectsArray);
        if (data.data?.permissions) {
          setPermissions(data.data.permissions);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAwardBadge = async (projectId: string) => {
    if (!rationale.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a rationale for the badge',
        variant: 'destructive',
      });
      return;
    }

    setIsAwarding(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/validator/badges/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: projectId,
          badge_type: badgeType,
          rationale: rationale.trim(),
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast({
          title: 'Success',
          description: `${badgeType.charAt(0).toUpperCase() + badgeType.slice(1)} badge awarded successfully`,
        });
        setSelectedProject(null);
        setRationale('');
        setBadgeType('silver');
        fetchProjects();
      } else {
        toast({
          title: 'Error',
          description: data.message || 'Failed to award badge',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to award badge',
        variant: 'destructive',
      });
    } finally {
      setIsAwarding(false);
    }
  };

  const getBadgeColor = (badge_type: string) => {
    switch (badge_type) {
      case 'platinum': return 'bg-gradient-to-r from-slate-300 to-slate-500 text-white';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'stone': return 'bg-gradient-to-r from-stone-400 to-stone-600 text-white';
      case 'demerit': return 'bg-gradient-to-r from-red-500 to-red-700 text-white';
      default: return 'bg-gray-500';
    }
  };

  const filteredProjects = projects.filter(project => {
    const hasNoBadges = !project.badges || project.badges.length === 0;
    const hasValidation = project.badges && project.badges.length > 0;

    if (filterTab === 'pending') return hasNoBadges;
    if (filterTab === 'validated') return hasValidation;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Validator Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Award validation badges to projects</p>
      </div>

      {permissions && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Can validate all projects:</strong> {permissions.can_validate_all ? 'Yes' : 'No'}</p>
              <p><strong>Allowed badge types:</strong> {permissions.allowed_badge_types.join(', ')}</p>
              {!permissions.can_validate_all && (
                <p><strong>Assigned projects:</strong> {permissions.allowed_project_ids.length} projects</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending Validation</TabsTrigger>
          <TabsTrigger value="validated">Validated</TabsTrigger>
          <TabsTrigger value="all">All Projects</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {filterTab === 'pending' ? 'No projects pending validation' : 'No projects found'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredProjects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{project.title}</CardTitle>
                    <CardDescription>{project.tagline}</CardDescription>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {project.creator && (
                        <span>By @{project.creator.username}</span>
                      )}
                      {project.hackathon_name && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{project.hackathon_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {project.proof_score || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Proof Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{project.description}</p>

                <div className="flex gap-2">
                  {project.demo_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Demo
                      </a>
                    </Button>
                  )}
                  {project.github_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        GitHub
                      </a>
                    </Button>
                  )}
                </div>

                {project.badges && project.badges.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-semibold mb-2">Existing Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.badges.map((badge, idx) => (
                        <Badge key={idx} className={getBadgeColor(badge.badge_type)}>
                          {badge.badge_type.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject === project.id ? (
                  <div className="border-t pt-4 space-y-3">
                    <h4 className="text-sm font-semibold">Award Badge</h4>
                    <Select value={badgeType} onValueChange={setBadgeType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {permissions?.allowed_badge_types.map(type => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder="Rationale for awarding this badge..."
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAwardBadge(project.id)}
                        disabled={isAwarding || !rationale.trim()}
                      >
                        {isAwarding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Awarding...
                          </>
                        ) : (
                          <>
                            <Award className="mr-2 h-4 w-4" />
                            Award Badge
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSelectedProject(null);
                        setRationale('');
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedProject(project.id)}
                    variant="default"
                    size="sm"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Award Badge
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
