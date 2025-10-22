import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

export default function Search() {
  const [query, setQuery] = useState('');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-4xl font-bold">Search</h1>
        
        <div className="relative mb-8">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects, users, hackathons..."
            className="pl-10 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            {query ? 'No results found. Try a different search term.' : 'Enter a search term to get started'}
          </p>
        </div>
      </div>
    </div>
  );
}
