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
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 transition-quick hover:opacity-80 flex-shrink-0">
            <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
              <Rocket className="h-5 w-5 text-foreground font-bold" />
            </div>
            <span className="text-xl font-black text-primary hidden sm:inline">
              0x.ship
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-quick">
              <TrendingUp className="h-4 w-4" />
              <span>Feed</span>
            </Link>
            <Link to="/leaderboard" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-quick">
              <Trophy className="h-4 w-4" />
              <span>Leaderboard</span>
            </Link>
            <Link to="/search" className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-quick">
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {user ? (
              <>
                {/* Wallet Connection */}
                <div className="hidden lg:flex">
                  <ConnectWallet />
                </div>

                {/* Publish Button */}
                <a href="/publish" className="btn-primary hidden md:inline-flex gap-2 px-4 py-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Publish</span>
                </a>

                {/* Intros */}
                <a href="/intros" className="btn-secondary hidden sm:inline-flex gap-2 px-4 py-2">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Intros</span>
                </a>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 rounded-full transition-quick hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary">
                      <Avatar className="h-8 w-8 border-3 border-primary">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="bg-primary text-foreground font-bold text-xs">
                          {user.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-3 space-y-1">
                      <p className="text-sm font-bold text-foreground">{user.displayName || user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer flex items-center gap-2 font-medium">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-projects" className="cursor-pointer flex items-center gap-2 font-medium">
                        <Plus className="h-4 w-4" />
                        <span>My Projects</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/intros" className="cursor-pointer flex items-center gap-2 font-medium">
                        <Send className="h-4 w-4" />
                        <span>Intro Requests</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/u/${user.username}`} className="cursor-pointer flex items-center gap-2 font-medium">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer flex items-center gap-2 font-medium">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive flex items-center gap-2 font-medium">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <a href="/login" className="btn-secondary px-4 py-2">
                  Login
                </a>
                <a href="/register" className="btn-primary px-4 py-2">
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
