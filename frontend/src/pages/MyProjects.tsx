import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const mockProjects = [
  {
    id: '1',
    title: 'DeFi Lending Platform',
    tagline: 'Decentralized lending protocol with AI-powered risk assessment',
    status: 'published',
    voteCount: 234,
    commentCount: 45,
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    title: 'NFT Marketplace Draft',
    tagline: 'Music NFT platform (work in progress)',
    status: 'draft',
    voteCount: 0,
    commentCount: 0,
    createdAt: '2024-03-20',
  },
];

export default function MyProjects() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">My Projects</h1>
          <p className="text-muted-foreground">Manage your published and draft projects</p>
        </div>
        <Button asChild>
          <Link to="/publish">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {mockProjects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{project.title}</h3>
                  <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                    {project.status}
                  </Badge>
                </div>
                <p className="mb-4 text-muted-foreground">{project.tagline}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{project.voteCount} votes</span>
                  <span>{project.commentCount} comments</span>
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/project/${project.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/project/${project.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {mockProjects.length === 0 && (
          <div className="py-20 text-center">
            <p className="mb-4 text-lg text-muted-foreground">You haven't published any projects yet.</p>
            <Button asChild>
              <Link to="/publish">
                <Plus className="mr-2 h-4 w-4" />
                Publish Your First Project
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
