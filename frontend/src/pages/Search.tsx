import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCardSkeletonGrid } from '@/components/ProjectCardSkeleton';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSearch } from '@/hooks/useSearch';

// Helper function to get the backend URL
const getBackendUrl = (): string => {
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const isDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  return isDev ? 'http://localhost:5000' : 'https://discovery-platform.onrender.com';
};

// Transform backend project data to frontend format (same as useProjects hook)
function transformProject(backendProject: any) {
  return {
    id: backendProject.id,
    title: backendProject.title,
    tagline: backendProject.tagline || '',
    description: backendProject.description,
    demoUrl: backendProject.demo_url,
    githubUrl: backendProject.github_url,
    hackathonName: backendProject.hackathon_name || '',
    hackathonDate: backendProject.hackathon_date || '',
    techStack: backendProject.tech_stack || [],
    teamMembers: backendProject.team_members || [],
    team_members: backendProject.team_members || [],
    screenshots: backendProject.screenshots?.map((s: any) => s.url) || [],
    authorId: backendProject.user_id,
    author: backendProject.creator ? {
      id: backendProject.creator.id,
      username: backendProject.creator.username,
      email: backendProject.creator.email || '',
      displayName: backendProject.creator.display_name,
      avatar: backendProject.creator.avatar_url,
      bio: backendProject.creator.bio,
      isVerified: backendProject.creator.email_verified || false,
      email_verified: backendProject.creator.email_verified || false,
      isAdmin: backendProject.creator.is_admin || false,
      walletAddress: backendProject.creator.wallet_address,
      wallet_address: backendProject.creator.wallet_address,
      full_wallet_address: backendProject.creator.full_wallet_address,
      github_connected: backendProject.creator.github_connected || false,
      github_username: backendProject.creator.github_username || '',
      has_oxcert: backendProject.creator.has_oxcert || false,
      hasOxcert: backendProject.creator.has_oxcert || false,
      oxcert_tx_hash: backendProject.creator.oxcert_tx_hash,
      oxcert_token_id: backendProject.creator.oxcert_token_id,
      oxcert_metadata: backendProject.creator.oxcert_metadata,
      createdAt: backendProject.creator.created_at,
      updatedAt: backendProject.creator.updated_at || backendProject.creator.created_at,
    } : {
      id: backendProject.user_id,
      username: 'Unknown',
      email: '',
      isVerified: false,
      email_verified: false,
      isAdmin: false,
      github_connected: false,
      github_username: '',
      has_oxcert: false,
      createdAt: '',
      updatedAt: '',
    },
    proofScore: {
      total: backendProject.proof_score || 0,
      verification: backendProject.verification_score || 0,
      community: backendProject.community_score || 0,
      validation: backendProject.validation_score || 0,
      quality: backendProject.quality_score || 0,
    },
    badges: backendProject.badges || [],
    voteCount: (backendProject.upvotes || 0) - (backendProject.downvotes || 0),
    commentCount: backendProject.comment_count || 0,
    userVote: backendProject.user_vote || null,
    user_vote: backendProject.user_vote || null,
    isFeatured: backendProject.is_featured || false,
    createdAt: backendProject.created_at,
    updatedAt: backendProject.updated_at,
  };
}

interface SearchResults {
  projects: any[];
  users: any[];
}

export default function Search() {
  const [query, setQuery] = useState('');

  // Instagram-style search: Debounce query + React Query caching
  const debouncedQuery = useDebounce(query, 300); // 300ms delay
  const { data, isLoading } = useSearch(debouncedQuery);

  // Extract results (with defaults)
  const results = data || { projects: [], users: [], total: 0 };
  const loading = isLoading;

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 py-12 overflow-hidden">
        <div className="mx-auto max-w-5xl w-full box-border">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <h1 className="text-3xl font-black text-foreground mb-2">Search Projects</h1>
            <p className="text-sm text-muted-foreground">
              Find projects, builders, and hackathons on 0x.ship
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-10 card-elevated p-6">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects, users, hackathons..."
                className="pl-12 text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && query && (
            <ProjectCardSkeletonGrid count={3} />
          )}

          {/* Results or Empty State */}
          {!loading && !query && (
            <div className="card-elevated p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🔍</div>
                <p className="text-lg font-bold text-foreground">Start your search</p>
                <p className="text-sm text-muted-foreground">
                  Enter keywords to find projects, discover builders, or explore hackathons
                </p>
              </div>
            </div>
          )}

          {!loading && results && (
            <div className="space-y-8">
              {/* Projects Results */}
              {results.projects && results.projects.length > 0 && (
                <div>
                  <h2 className="text-xl font-black mb-4">
                    Projects ({results.projects.length})
                  </h2>
                  <div className="space-y-4">
                    {results.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {results.users && results.users.length > 0 && (
                <div>
                  <h2 className="text-xl font-black mb-4">
                    Builders ({results.users.length})
                  </h2>
                  <div className="grid gap-4">
                    {results.users.map((user) => (
                      <Link
                        key={user.id}
                        to={`/u/${user.username}`}
                        className="card-elevated p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url} alt={user.username} />
                          <AvatarFallback className="bg-primary text-black font-bold">
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-foreground">{user.display_name || user.username}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {(!results.projects || results.projects.length === 0) &&
                (!results.users || results.users.length === 0) && (
                  <div className="card-elevated p-12 text-center">
                    <div className="space-y-4">
                      <p className="text-lg font-bold text-foreground">No results found</p>
                      <p className="text-sm text-muted-foreground">
                        Try a different search term or browse recent projects
                      </p>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
