import { Link } from 'react-router-dom';
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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-black text-foreground mb-2">My Projects</h1>
                <p className="text-base text-muted-foreground">
                  Manage your published and draft projects
                </p>
              </div>
              <Link to="/publish" className="btn-primary inline-flex items-center gap-2 px-4 py-2 flex-shrink-0">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Link>
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            {mockProjects.map((project) => (
              <div key={project.id} className="card-elevated p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-xl font-black text-foreground">{project.title}</h3>
                      <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">{project.tagline}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground">
                      <span>{project.voteCount} votes</span>
                      <span>{project.commentCount} comments</span>
                      <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Link to={`/project/${project.id}`} className="btn-secondary inline-flex items-center gap-2 px-3 py-2">
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">View</span>
                    </Link>
                    <Link to={`/project/${project.id}/edit`} className="btn-secondary inline-flex items-center gap-2 px-3 py-2">
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <button className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-destructive hover:opacity-80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {mockProjects.length === 0 && (
              <div className="card-elevated p-12 text-center">
                <div className="space-y-4">
                  <p className="text-lg font-bold text-foreground">You haven't published any projects yet.</p>
                  <p className="text-sm text-muted-foreground mb-6">Start by creating and publishing your first hackathon project</p>
                  <Link to="/publish" className="btn-primary inline-flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Publish Your First Project
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
