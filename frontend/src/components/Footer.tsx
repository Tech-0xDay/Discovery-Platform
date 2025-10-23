import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-semibold">0x.ship</h3>
            <p className="text-sm text-muted-foreground">
              Proof-weighted discovery platform for hackathon projects.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-smooth hover:text-foreground">
                  Feed
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-muted-foreground transition-smooth hover:text-foreground">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-muted-foreground transition-smooth hover:text-foreground">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground transition-smooth hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-smooth hover:text-foreground">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground transition-smooth hover:text-foreground">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold">Connect</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-smooth hover:text-primary"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-smooth hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} 0x.ship. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
