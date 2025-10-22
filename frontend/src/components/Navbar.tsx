import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Rocket, TrendingUp, Trophy, Search, Plus, LogOut, User, Settings, LayoutDashboard, Send, Menu, X } from 'lucide-react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 transition-smooth hover:opacity-80 flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative bg-card rounded-lg p-1.5">
                <Rocket className="h-5 w-5 text-primary" />
              </div>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:inline">
              0x.ship
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Feed</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth">
              <Trophy className="h-4 w-4" />
              <span className="font-medium">Leaderboard</span>
            </Link>
            <Link to="/search" className="flex items-center gap-2 px-4 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth">
              <Search className="h-4 w-4" />
              <span className="font-medium">Search</span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <>
                {/* Wallet Connection */}
                <div className="hidden lg:flex">
                  <ConnectWallet />
                </div>

                {/* Publish Button */}
                <Button asChild variant="default" size="sm" className="hidden md:flex gap-2 gradient-primary">
                  <Link to="/publish">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Publish</span>
                  </Link>
                </Button>

                {/* Intros */}
                <Button asChild variant="ghost" size="sm" className="gap-2 hidden sm:flex">
                  <Link to="/intros">
                    <Send className="h-4 w-4" />
                    <span className="hidden sm:inline">Intros</span>
                  </Link>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full transition-smooth hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                      <Avatar className="h-8 w-8 border-2 border-primary/20">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-xs font-semibold">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-3 space-y-1">
                      <p className="text-sm font-semibold text-foreground">{user.displayName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-projects" className="cursor-pointer flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        <span>My Projects</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/intros" className="cursor-pointer flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        <span>Intro Requests</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/u/${user.username}`} className="cursor-pointer flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive flex items-center gap-2">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="gradient-primary">
                  <Link to="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
