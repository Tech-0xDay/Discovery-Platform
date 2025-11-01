import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Shield, Users, Award, FolderOpen, TrendingUp, CheckCircle, XCircle, Loader2, Ban, Trash2, Upload, Copy, ExternalLink, List } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from 'sonner';
import { adminService } from '@/services/api';
import {
  useAdminStats,
  useAdminUsers,
  useAdminValidators,
  useAdminProjects,
  useAdminInvestorRequests,
  useToggleUserAdmin,
  useToggleUserActive,
  useAddValidator,
  useRemoveValidator,
  useUpdateValidatorPermissions,
  useToggleProjectFeatured,
  useDeleteProject,
  useAwardCustomBadge,
  useApproveInvestorRequest,
  useRejectInvestorRequest,
} from '@/hooks/useAdmin';

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
    allowed_categories: string[];
  };
  assignments?: {
    total: number;
    pending: number;
    in_review: number;
    completed: number;
    category_breakdown?: Record<string, number>;
  };
}

interface Stats {
  users: { total: number; active: number; admins: number; validators: number; investors: number };
  projects: { total: number; featured: number };
  badges: { total: number; breakdown: Record<string, number> };
  investor_requests: { pending: number; approved: number };
}

interface BadgeItem {
  id: string;
  badge_type: string;
  custom_name?: string;
  points: number;
  rationale: string;
  created_at: string;
  project?: {
    id: string;
    title: string;
  };
  validator?: {
    id: string;
    username: string;
  };
}

function BadgeManagementList() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBadgeType, setFilterBadgeType] = useState('all');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
  const [editBadgeType, setEditBadgeType] = useState('');
  const [editRationale, setEditRationale] = useState('');

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const params: any = { perPage: 100 };
      if (filterBadgeType && filterBadgeType !== 'all') params.badgeType = filterBadgeType;
      if (filterProjectId) params.projectId = filterProjectId;

      const response = await adminService.getAllBadges(params);
      setBadges(response.data.data.badges || []);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
      toast.error('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleEditBadge = (badge: BadgeItem) => {
    setEditingBadge(badge);
    setEditBadgeType(badge.badge_type);
    setEditRationale(badge.rationale);
  };

  const handleUpdateBadge = async () => {
    if (!editingBadge) return;

    try {
      await adminService.updateBadge(editingBadge.id, {
        badge_type: editBadgeType,
        rationale: editRationale,
      });
      toast.success('Badge updated successfully');
      setEditingBadge(null);
      fetchBadges();
    } catch (error) {
      console.error('Failed to update badge:', error);
      toast.error('Failed to update badge');
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to delete this badge? If this is the last badge, the project will be reset to pending validation status.')) return;

    try {
      const response = await adminService.deleteBadge(badgeId);
      toast.success(response.data.message || 'Badge deleted successfully');
      fetchBadges();
    } catch (error: any) {
      console.error('Failed to delete badge:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete badge';
      toast.error(errorMessage);
    }
  };

  const getBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      stone: 'bg-gray-500',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500',
      demerit: 'bg-red-500',
      custom: 'bg-blue-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filter by Badge Type</Label>
              <Select value={filterBadgeType} onValueChange={setFilterBadgeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stone">Stone</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="demerit">Demerit</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label>Filter by Project ID</Label>
              <Input
                placeholder="Enter project ID..."
                value={filterProjectId}
                onChange={(e) => setFilterProjectId(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={fetchBadges}>
                Apply Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : badges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No badges found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {badges.map((badge) => (
            <Card key={badge.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getBadgeColor(badge.badge_type)}>
                        {badge.custom_name || badge.badge_type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {badge.points} points
                      </span>
                    </div>
                    {badge.project && (
                      <p className="text-sm font-medium">
                        Project: {badge.project.title}
                      </p>
                    )}
                    {badge.validator && (
                      <p className="text-sm text-muted-foreground">
                        Awarded by: {badge.validator.username}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      Rationale: {badge.rationale || 'No rationale provided'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {badge.id} • Created: {new Date(badge.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBadge(badge)}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Badge</DialogTitle>
                          <DialogDescription>
                            Update badge type or rationale
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Badge Type</Label>
                            <Select value={editBadgeType} onValueChange={setEditBadgeType}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="stone">Stone (5 pts)</SelectItem>
                                <SelectItem value="silver">Silver (10 pts)</SelectItem>
                                <SelectItem value="gold">Gold (15 pts)</SelectItem>
                                <SelectItem value="platinum">Platinum (20 pts)</SelectItem>
                                <SelectItem value="demerit">Demerit (-10 pts)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Rationale</Label>
                            <Textarea
                              value={editRationale}
                              onChange={(e) => setEditRationale(e.target.value)}
                              placeholder="Reason for this badge..."
                            />
                          </div>
                          <Button onClick={handleUpdateBadge} className="w-full">
                            Update Badge
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBadge(badge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Badge Dialog - Controlled outside map */}
      {editingBadge && (
        <Dialog open={!!editingBadge} onOpenChange={() => setEditingBadge(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Badge</DialogTitle>
              <DialogDescription>
                Update badge type or rationale for project: {editingBadge.project?.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Badge Type</Label>
                <Select value={editBadgeType} onValueChange={setEditBadgeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stone">Stone (5 pts)</SelectItem>
                    <SelectItem value="silver">Silver (10 pts)</SelectItem>
                    <SelectItem value="gold">Gold (15 pts)</SelectItem>
                    <SelectItem value="platinum">Platinum (20 pts)</SelectItem>
                    <SelectItem value="demerit">Demerit (-10 pts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rationale</Label>
                <Textarea
                  value={editRationale}
                  onChange={(e) => setEditRationale(e.target.value)}
                  placeholder="Reason for this badge..."
                />
              </div>
              <Button onClick={handleUpdateBadge} className="w-full">
                Update Badge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function Admin() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');
  const [validatorTab, setValidatorTab] = useState('current');
  const [investorTab, setInvestorTab] = useState('current');

  // Search/filter state
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');

  // Validator state
  const [newValidatorEmail, setNewValidatorEmail] = useState('');
  const [selectedValidatorId, setSelectedValidatorId] = useState<string>('');
  const [validatorPermissions, setValidatorPermissions] = useState({
    can_validate_all: false,
    allowed_badge_types: ['stone', 'silver', 'gold', 'platinum', 'demerit'],
    allowed_categories: [] as string[],
  });
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [currentValidatorForAssignment, setCurrentValidatorForAssignment] = useState<string>('');

  // Badge state
  const [customBadgeName, setCustomBadgeName] = useState('');
  const [customBadgeImage, setCustomBadgeImage] = useState('');
  const [customBadgePoints, setCustomBadgePoints] = useState(10);
  const [customBadgeProjectId, setCustomBadgeProjectId] = useState('');
  const [customBadgeRationale, setCustomBadgeRationale] = useState('');

  // OPTIMIZED: Load all data on mount with React Query (cached automatically)
  const { data: stats } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ search: userSearch, role: userFilter, perPage: 100 });
  const { data: validatorsData, isLoading: validatorsLoading } = useAdminValidators();
  const { data: projectsData, isLoading: projectsLoading } = useAdminProjects({ search: projectSearch, perPage: 100 });
  const { data: investorRequestsData, isLoading: investorsLoading } = useAdminInvestorRequests();

  const users = usersData?.users || [];
  const validators = validatorsData || [];
  const projects = projectsData?.projects || [];
  const investorRequests = investorRequestsData || [];

  // Mutations
  const toggleUserAdminMutation = useToggleUserAdmin();
  const toggleUserActiveMutation = useToggleUserActive();
  const addValidatorMutation = useAddValidator();
  const removeValidatorMutation = useRemoveValidator();
  const updateValidatorPermissionsMutation = useUpdateValidatorPermissions();
  const toggleProjectFeaturedMutation = useToggleProjectFeatured();
  const deleteProjectMutation = useDeleteProject();
  const awardCustomBadgeMutation = useAwardCustomBadge();
  const approveInvestorMutation = useApproveInvestorRequest();
  const rejectInvestorMutation = useRejectInvestorRequest();

  // ==================== Action Handlers ====================

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
  };

  const handleAddValidator = () => {
    if (!newValidatorEmail.trim()) {
      toast({ title: 'Error', description: 'Email is required', variant: 'destructive' });
      return;
    }
    addValidatorMutation.mutate(newValidatorEmail, {
      onSuccess: () => setNewValidatorEmail(''),
    });
  };

  const handleUpdateValidatorPermissions = () => {
    if (!selectedValidatorId) return;
    updateValidatorPermissionsMutation.mutate(
      { validatorId: selectedValidatorId, permissions: validatorPermissions },
      { onSuccess: () => setSelectedValidatorId('') }
    );
  };

  const handleAwardCustomBadge = () => {
    if (!customBadgeProjectId || !customBadgeName || !customBadgeRationale) {
      toast({ title: 'Error', description: 'All fields required', variant: 'destructive' });
      return;
    }
    awardCustomBadgeMutation.mutate({
      project_id: customBadgeProjectId,
      badge_type: 'custom',
      custom_name: customBadgeName,
      custom_image: customBadgeImage,
      points: customBadgePoints,
      rationale: customBadgeRationale,
    }, {
      onSuccess: () => {
        setCustomBadgeName('');
        setCustomBadgeImage('');
        setCustomBadgeProjectId('');
        setCustomBadgeRationale('');
      }
    });
  };

  const handleDeleteProject = (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    deleteProjectMutation.mutate(projectId);
  };

  const handleAssignSelectedProjects = async () => {
    if (!currentValidatorForAssignment || selectedProjects.length === 0) {
      toast({ title: 'Error', description: 'Select projects and validator', variant: 'destructive' });
      return;
    }

    try {
      const promises = selectedProjects.map(projectId =>
        adminService.assignProjectToValidator({
          validator_id: currentValidatorForAssignment,
          project_id: projectId,
          priority: 'normal'
        })
      );

      await Promise.all(promises);
      toast({
        title: 'Success',
        description: `${selectedProjects.length} project(s) assigned successfully!`
      });
      setSelectedProjects([]);
      setCurrentValidatorForAssignment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign some projects',
        variant: 'destructive'
      });
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleSelectAllProjects = () => {
    if (selectedProjects.length === projects.length) {
      setSelectedProjects([]);
    } else {
      setSelectedProjects(projects.map(p => p.id));
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
          </div>

          {usersLoading ? (
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
                        {user.is_active === false && <Badge variant="destructive">Banned</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserAdminMutation.mutate(user.id)}
                      >
                        {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                      <Button
                        size="sm"
                        variant={user.is_active ? 'destructive' : 'default'}
                        onClick={() => toggleUserActiveMutation.mutate(user.id)}
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
                <Button onClick={handleAddValidator}>Add Validator</Button>
              </div>
            </CardContent>
          </Card>

          {validatorsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {validators.map(validator => (
                <Card key={validator.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{validator.username}</p>
                          <Badge variant="secondary">Validator</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{validator.email}</p>
                        {validator.permissions && (
                          <div className="mt-2 text-sm space-y-1">
                            <p className="text-muted-foreground">
                              Validate all: {validator.permissions.can_validate_all ? '✓ Yes' : '✗ No'}
                            </p>
                            <p className="text-muted-foreground">
                              Badge types: {validator.permissions.allowed_badge_types.join(', ')}
                            </p>
                            {validator.permissions.allowed_categories && validator.permissions.allowed_categories.length > 0 && (
                              <p className="text-muted-foreground">
                                Categories: {validator.permissions.allowed_categories.join(', ')}
                              </p>
                            )}
                          </div>
                        )}
                        {validator.assignments && (
                          <>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {validator.assignments.total} Total
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {validator.assignments.pending} Pending
                              </Badge>
                              <Badge variant="default" className="text-xs bg-blue-500">
                                {validator.assignments.in_review} In Review
                              </Badge>
                              <Badge variant="default" className="text-xs bg-green-500">
                                {validator.assignments.completed} Completed
                              </Badge>
                            </div>
                            {validator.assignments.category_breakdown && Object.keys(validator.assignments.category_breakdown).length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-1 font-semibold">Assigned Project Categories:</p>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(validator.assignments.category_breakdown).map(([category, count]) => (
                                    <Badge key={category} variant="outline" className="text-xs bg-primary/10">
                                      {category} ({count})
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* Bulk Assign by Domain */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={validator.assignments && validator.assignments.total > 0 ? "outline" : "default"}
                            >
                              {validator.assignments && validator.assignments.total > 0
                                ? "Manage Assignments"
                                : "Assign by Domain"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {validator.assignments && validator.assignments.total > 0
                                  ? `Manage Assignments for ${validator.username}`
                                  : `Assign Projects to ${validator.username}`}
                              </DialogTitle>
                              <DialogDescription>
                                {validator.assignments && validator.assignments.total > 0
                                  ? `Currently has ${validator.assignments.total} assignments. Assign more projects by category.`
                                  : "Bulk assign projects by category filter"}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* Show current assignment breakdown */}
                              {validator.assignments && validator.assignments.total > 0 && validator.assignments.category_breakdown && (
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm font-semibold mb-2">Current Assignments by Category:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {Object.entries(validator.assignments.category_breakdown).map(([category, count]) => (
                                      <Badge key={category} variant="secondary" className="text-xs">
                                        {category}: {count}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label>Category Filter</Label>
                                <select
                                  className="w-full mt-1 p-2 border rounded-md"
                                  defaultValue="all"
                                  id={`category-${validator.id}`}
                                >
                                  <option value="all">All Projects</option>
                                  <option value="AI/ML">AI/ML</option>
                                  <option value="Web3/Blockchain">Web3/Blockchain</option>
                                  <option value="FinTech">FinTech</option>
                                  <option value="HealthTech">HealthTech</option>
                                  <option value="EdTech">EdTech</option>
                                  <option value="E-Commerce">E-Commerce</option>
                                  <option value="SaaS">SaaS</option>
                                  <option value="DevTools">DevTools</option>
                                  <option value="IoT">IoT</option>
                                  <option value="Gaming">Gaming</option>
                                  <option value="Social">Social</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <Label>Limit (max projects)</Label>
                                <Input
                                  type="number"
                                  defaultValue="50"
                                  min="1"
                                  max="200"
                                  id={`limit-${validator.id}`}
                                />
                              </div>
                              <div>
                                <Label>Priority</Label>
                                <select
                                  className="w-full mt-1 p-2 border rounded-md"
                                  defaultValue="normal"
                                  id={`priority-${validator.id}`}
                                >
                                  <option value="low">Low</option>
                                  <option value="normal">Normal</option>
                                  <option value="high">High</option>
                                  <option value="urgent">Urgent</option>
                                </select>
                              </div>
                              <Button
                                className="w-full"
                                onClick={() => {
                                  const category = (document.getElementById(`category-${validator.id}`) as HTMLSelectElement)?.value;
                                  const limit = parseInt((document.getElementById(`limit-${validator.id}`) as HTMLInputElement)?.value || '50');
                                  const priority = (document.getElementById(`priority-${validator.id}`) as HTMLSelectElement)?.value;

                                  toast.promise(
                                    adminService.bulkAssignProjects({
                                      validator_id: validator.id,
                                      category_filter: category,
                                      priority,
                                      limit
                                    }),
                                    {
                                      loading: 'Assigning projects...',
                                      success: (res) => `${res.data.data.count} projects assigned successfully!`,
                                      error: 'Failed to assign projects'
                                    }
                                  );
                                }}
                              >
                                Assign Projects
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Individual Project Assignment */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => {
                                setCurrentValidatorForAssignment(validator.id);
                                setSelectedProjects([]);
                              }}
                            >
                              <List className="h-4 w-4 mr-1" />
                              Select Projects
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                            <DialogHeader>
                              <DialogTitle>Assign Specific Projects to {validator.username}</DialogTitle>
                              <DialogDescription>
                                Select individual projects to assign
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                              {/* Select All Checkbox */}
                              <div className="sticky top-0 bg-background z-10 pb-2 border-b">
                                <label className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedProjects.length === projects.length && projects.length > 0}
                                    onChange={toggleSelectAllProjects}
                                    className="w-4 h-4"
                                  />
                                  <span className="font-semibold">Select All ({projects.length} projects)</span>
                                </label>
                              </div>

                              {/* Project List */}
                              {projectsLoading ? (
                                <div className="flex justify-center py-8">
                                  <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                              ) : projects.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No projects available</p>
                              ) : (
                                projects.map(project => (
                                  <label
                                    key={project.id}
                                    className="flex items-start gap-2 p-3 hover:bg-muted rounded cursor-pointer border"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selectedProjects.includes(project.id)}
                                      onChange={() => toggleProjectSelection(project.id)}
                                      className="w-4 h-4 mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{project.title}</p>
                                      <p className="text-sm text-muted-foreground truncate">
                                        {project.description?.substring(0, 100)}...
                                      </p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Score: {project.proof_score} • By {project.creator?.username || 'Unknown'}
                                      </p>
                                    </div>
                                  </label>
                                ))
                              )}
                            </div>
                            <div className="pt-4 border-t">
                              <p className="text-sm text-muted-foreground mb-2">
                                {selectedProjects.length} project(s) selected
                              </p>
                              <Button
                                className="w-full"
                                onClick={handleAssignSelectedProjects}
                                disabled={selectedProjects.length === 0}
                              >
                                Assign Selected Projects
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Permissions Button */}
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
                              <div>
                                <Label>Allowed Categories (auto-assignment)</Label>
                                <p className="text-xs text-muted-foreground mb-2">
                                  New projects with these categories will be auto-assigned to this validator
                                </p>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  {['AI/ML', 'Web3/Blockchain', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce', 'SaaS', 'DevTools', 'IoT', 'Gaming', 'Social', 'Other'].map(cat => (
                                    <div key={cat} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`cat-${cat}`}
                                        checked={validatorPermissions.allowed_categories?.includes(cat) || false}
                                        onChange={(e) => {
                                          const categories = e.target.checked
                                            ? [...(validatorPermissions.allowed_categories || []), cat]
                                            : (validatorPermissions.allowed_categories || []).filter(c => c !== cat);
                                          setValidatorPermissions({
                                            ...validatorPermissions,
                                            allowed_categories: categories
                                          });
                                        }}
                                      />
                                      <Label htmlFor={`cat-${cat}`} className="text-xs">{cat}</Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <Button onClick={handleUpdateValidatorPermissions}>
                                Save Permissions
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Remove Button */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeValidatorMutation.mutate(validator.id)}
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
          </div>

          {projectsLoading ? (
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
                        <Link
                          to={`/project/${project.id}`}
                          className="font-semibold hover:text-primary transition-colors flex items-center gap-1"
                        >
                          {project.title}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                        {project.is_featured && <Badge>Featured</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        By {project.creator?.username || 'Unknown'} • Score: {project.proof_score}
                      </p>
                      <button
                        onClick={() => copyToClipboard(project.id, 'Project ID')}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
                      >
                        <Copy className="h-3 w-3" />
                        ID: {project.id.slice(0, 8)}...
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleProjectFeaturedMutation.mutate(project.id)}
                      >
                        {project.is_featured ? 'Unfeature' : 'Feature'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProject(project.id)}
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
          <Tabs value={validatorTab} onValueChange={setValidatorTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="current">All Badges</TabsTrigger>
              <TabsTrigger value="award">Award Badge</TabsTrigger>
            </TabsList>

            {/* All Badges List */}
            <TabsContent value="current" className="mt-4 space-y-4">
              <BadgeManagementList />
            </TabsContent>

            {/* Award New Badge */}
            <TabsContent value="award" className="mt-4">
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
                  <Button onClick={handleAwardCustomBadge}>
                    <Upload className="h-4 w-4 mr-2" />
                    Award Custom Badge
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Investors Tab with Subtabs */}
        <TabsContent value="investors" className="space-y-4 mt-6">
          <Tabs value={investorTab} onValueChange={setInvestorTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests">Pending Requests</TabsTrigger>
              <TabsTrigger value="current">Current Investors</TabsTrigger>
            </TabsList>

            {/* Pending Requests */}
            <TabsContent value="requests" className="mt-4">
              {investorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {investorRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No pending investor requests</p>
                      </CardContent>
                    </Card>
                  ) : (
                    investorRequests.filter(r => r.status === 'pending').map(request => (
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
                                onClick={() => approveInvestorMutation.mutate(request.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectInvestorMutation.mutate(request.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>

            {/* Current Investors */}
            <TabsContent value="current" className="mt-4">
              {investorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {investorRequests.filter(r => r.status === 'approved').length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">No approved investors yet</p>
                      </CardContent>
                    </Card>
                  ) : (
                    investorRequests.filter(r => r.status === 'approved').map(request => (
                      <Card key={request.id}>
                        <CardContent className="py-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{request.user?.username || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                              <div className="mt-2">
                                <Badge variant="outline">{request.plan_type}</Badge>
                                {request.company_name && (
                                  <p className="text-sm mt-1">Company: {request.company_name}</p>
                                )}
                              </div>
                            </div>
                            <Badge>Active</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
