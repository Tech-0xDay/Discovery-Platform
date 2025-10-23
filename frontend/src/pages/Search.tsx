import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <h1 className="text-4xl font-black text-foreground mb-2">Search Projects</h1>
            <p className="text-base text-muted-foreground">
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
                className="pl-12 text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Results or Empty State */}
          {!query ? (
            <div className="card-elevated p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🔍</div>
                <p className="text-lg font-bold text-foreground">Start your search</p>
                <p className="text-sm text-muted-foreground">
                  Enter keywords to find projects, discover builders, or explore hackathons
                </p>
              </div>
            </div>
          ) : (
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
      </div>
    </div>
  );
}
