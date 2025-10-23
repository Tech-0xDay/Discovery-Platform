import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SearchResults {
  projects: any[];
  users: any[];
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults(null);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (data.status === 'success') {
          setResults(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
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
          {loading && (
            <div className="card-elevated p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-sm text-muted-foreground">Searching...</p>
            </div>
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
                          <AvatarFallback className="bg-primary text-foreground font-bold">
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
