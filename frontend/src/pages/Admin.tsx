import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, Users, Award, FolderOpen, TrendingUp, CheckCircle, XCircle, Loader2, Ban, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

interface User {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  is_admin: boolean;
  is_investor: boolean;
  is_validator: boolean;
  is_active: boolean;
  karma: number;
  created_at: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  creator?: { username: string };
  proof_score: number;
  is_featured: boolean;
  created_at: string;
}

interface InvestorRequest {
  id: string;
  user_id: string;
  plan_type: string;
  company_name?: string;
  status: string;
  created_at: string;
  user?: { username: string; email: string };
}

interface ValidatorWithPermissions {
  id: string;
  username: string;
  email: string;
  is_validator: boolean;
  permissions?: {
    can_validate_all: boolean;
    allowed_badge_types: string[];
    allowed_project_ids: string[];
  };
}

interface Stats {
  users: { total: number; active: number; admins: number; validators: number; investors: number };
  projects: { total: number; featured: number };
  badges: { total: number; breakdown: Record<string, number> };
  investor_requests: { pending: number; approved: number };
}

export default function Admin() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  // Validators state
  const [validators, setValidators] = useState<ValidatorWithPermissions[]>([]);
  const [newValidatorEmail, setNewValidatorEmail] = useState('');
  const [selectedValidatorId, setSelectedValidatorId] = useState<string>('');
  const [validatorPermissions, setValidatorPermissions] = useState({
    can_validate_all: false,
    allowed_badge_types: ['stone', 'silver', 'gold', 'platinum', 'demerit'],
  });

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSearch, setProjectSearch] = useState('');

  // Badges state
  const [customBadgeName, setCustomBadgeName] = useState('');
  const [customBadgeImage, setCustomBadgeImage] = useState('');
  const [customBadgePoints, setCustomBadgePoints] = useState(10);
  const [customBadgeProjectId, setCustomBadgeProjectId] = useState('');
  const [customBadgeRationale, setCustomBadgeRationale] = useState('');

  // Investor requests state
  const [investorRequests, setInvestorRequests] = useState<InvestorRequest[]>([]);

  // Analytics state
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (token) {
      if (activeTab === 'analytics') fetchStats();
      if (activeTab === 'users') fetchUsers();
      if (activeTab === 'validators') fetchValidators();
      if (activeTab === 'projects') fetchProjects();
      if (activeTab === 'investors') fetchInvestorRequests();
    }
  }, [token, activeTab]);

  // ==================== API Calls ====================

  const fetchStats = async () => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/users?per_page=100&role=${userFilter}&search=${userSearch}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setUsers(data.data.users);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch users', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchValidators = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/validators`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setValidators(data.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch validators', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/projects?per_page=100&search=${projectSearch}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setProjects(data.data.projects);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch projects', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestorRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/investor-requests`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') setInvestorRequests(data.data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to fetch investor requests', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // User Management Actions
  const toggleUserAdmin = async (userId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/users/${userId}/toggle-admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'User admin status updated' });
        fetchUsers();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  const toggleUserActive = async (userId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/users/${userId}/toggle-active`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: data.message });
        fetchUsers();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    }
  };

  // Validator Management Actions
  const addValidator = async () => {
    if (!newValidatorEmail.trim()) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/validators/add-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: newValidatorEmail }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: data.message });
        setNewValidatorEmail('');
        fetchValidators();
      } else if (data.status === 'pending') {
        toast({ title: 'Account Not Found', description: data.message, variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: data.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add validator', variant: 'destructive' });
    }
  };

  const removeValidator = async (validatorId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/validators/${validatorId}/remove`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'Validator removed' });
        fetchValidators();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove validator', variant: 'destructive' });
    }
  };

  const updateValidatorPermissions = async () => {
    if (!selectedValidatorId) return;
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/validators/${selectedValidatorId}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(validatorPermissions),
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'Permissions updated' });
        setSelectedValidatorId('');
        fetchValidators();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update permissions', variant: 'destructive' });
    }
  };

  // Project Management Actions
  const toggleProjectFeatured = async (projectId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/projects/${projectId}/feature`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: data.message });
        fetchProjects();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update project', variant: 'destructive' });
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'Project deleted' });
        fetchProjects();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };

  // Badge Management Actions
  const awardCustomBadge = async () => {
    if (!customBadgeProjectId || !customBadgeName || !customBadgeRationale) {
      toast({ title: 'Error', description: 'All fields required', variant: 'destructive' });
      return;
    }
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/badges/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          project_id: customBadgeProjectId,
          badge_type: 'custom',
          custom_name: customBadgeName,
          custom_image: customBadgeImage,
          points: customBadgePoints,
          rationale: customBadgeRationale,
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'Custom badge awarded' });
        setCustomBadgeName('');
        setCustomBadgeImage('');
        setCustomBadgeProjectId('');
        setCustomBadgeRationale('');
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to award badge', variant: 'destructive' });
    }
  };

  // Investor Request Actions
  const approveInvestorRequest = async (requestId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/investor-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'Investor request approved' });
        fetchInvestorRequests();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
    }
  };

  const rejectInvestorRequest = async (requestId: string) => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/admin/investor-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: 'Success', description: 'Investor request rejected' });
        fetchInvestorRequests();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' });
    }
  };

  // ==================== Render ====================

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">Manage users, validators, projects, and platform settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="validators">
            <Shield className="h-4 w-4 mr-2" />
            Validators
          </TabsTrigger>
          <TabsTrigger value="projects">
            <FolderOpen className="h-4 w-4 mr-2" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="badges">
            <Award className="h-4 w-4 mr-2" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="investors">
            <Users className="h-4 w-4 mr-2" />
            Investors
          </TabsTrigger>
        </TabsList>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 mt-6">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.users.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.users.active} active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.projects.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.projects.featured} featured
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Validators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.users.validators}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.users.admins} admins
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Badges Awarded</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.badges.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.badges.breakdown.platinum} platinum
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="validator">Validators</SelectItem>
                <SelectItem value="investor">Investors</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers}>Search</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {users.map(user => (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        {user.is_admin && <Badge>Admin</Badge>}
                        {user.is_validator && <Badge variant="secondary">Validator</Badge>}
                        {user.is_investor && <Badge variant="outline">Investor</Badge>}
                        {!user.is_active && <Badge variant="destructive">Banned</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserAdmin(user.id)}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_active ? 'destructive' : 'default'}
                        onClick={() => toggleUserActive(user.id)}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        {user.is_active ? 'Ban' : 'Unban'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Validators Tab */}
        <TabsContent value="validators" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Validator</CardTitle>
              <CardDescription>Add a user as validator by email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="validator@example.com"
                  value={newValidatorEmail}
                  onChange={(e) => setNewValidatorEmail(e.target.value)}
                />
                <Button onClick={addValidator}>Add Validator</Button>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {validators.map(validator => (
                <Card key={validator.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{validator.username}</p>
                        <p className="text-sm text-muted-foreground">{validator.email}</p>
                        {validator.permissions && (
                          <div className="mt-2 text-sm">
                            <p>Validate all: {validator.permissions.can_validate_all ? 'Yes' : 'No'}</p>
                            <p>Badge types: {validator.permissions.allowed_badge_types.join(', ')}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedValidatorId(validator.id);
                                if (validator.permissions) {
                                  setValidatorPermissions(validator.permissions);
                                }
                              }}
                            >
                              Edit Permissions
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Validator Permissions</DialogTitle>
                              <DialogDescription>
                                Configure what {validator.username} can validate
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="validate-all"
                                  checked={validatorPermissions.can_validate_all}
                                  onChange={(e) => setValidatorPermissions({
                                    ...validatorPermissions,
                                    can_validate_all: e.target.checked
                                  })}
                                />
                                <Label htmlFor="validate-all">Can validate all projects</Label>
                              </div>
                              <div>
                                <Label>Allowed Badge Types</Label>
                                <div className="space-y-2 mt-2">
                                  {['stone', 'silver', 'gold', 'platinum', 'demerit'].map(type => (
                                    <div key={type} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`badge-${type}`}
                                        checked={validatorPermissions.allowed_badge_types.includes(type)}
                                        onChange={(e) => {
                                          const types = e.target.checked
                                            ? [...validatorPermissions.allowed_badge_types, type]
                                            : validatorPermissions.allowed_badge_types.filter(t => t !== type);
                                          setValidatorPermissions({
                                            ...validatorPermissions,
                                            allowed_badge_types: types
                                          });
                                        }}
                                      />
                                      <Label htmlFor={`badge-${type}`}>{type}</Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Button onClick={updateValidatorPermissions}>
                                Save Permissions
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeValidator(validator.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4 mt-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search projects..."
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={fetchProjects}>Search</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(project => (
                <Card key={project.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{project.title}</p>
                        {project.is_featured && <Badge>Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {project.creator?.username || 'Unknown'} • Score: {project.proof_score}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleProjectFeatured(project.id)}
                      >
                        {project.is_featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProject(project.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Award Custom Badge</CardTitle>
              <CardDescription>Create and award a custom badge with image</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Project ID</Label>
                <Input
                  placeholder="Project ID"
                  value={customBadgeProjectId}
                  onChange={(e) => setCustomBadgeProjectId(e.target.value)}
                />
              </div>
              <div>
                <Label>Badge Name</Label>
                <Input
                  placeholder="e.g., Innovation Award"
                  value={customBadgeName}
                  onChange={(e) => setCustomBadgeName(e.target.value)}
                />
              </div>
              <div>
                <Label>Badge Image URL (Optional)</Label>
                <Input
                  placeholder="https://..."
                  value={customBadgeImage}
                  onChange={(e) => setCustomBadgeImage(e.target.value)}
                />
              </div>
              <div>
                <Label>Points</Label>
                <Input
                  type="number"
                  value={customBadgePoints}
                  onChange={(e) => setCustomBadgePoints(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Rationale</Label>
                <Textarea
                  placeholder="Why are you awarding this badge?"
                  value={customBadgeRationale}
                  onChange={(e) => setCustomBadgeRationale(e.target.value)}
                />
              </div>
              <Button onClick={awardCustomBadge}>
                <Upload className="h-4 w-4 mr-2" />
                Award Custom Badge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investors Tab */}
        <TabsContent value="investors" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {investorRequests.filter(r => r.status === 'pending').map(request => (
                <Card key={request.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{request.user?.username || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                        <div className="mt-2">
                          <Badge>{request.plan_type}</Badge>
                          {request.company_name && (
                            <p className="text-sm mt-1">Company: {request.company_name}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => approveInvestorRequest(request.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectInvestorRequest(request.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
