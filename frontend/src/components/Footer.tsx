import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="ZERO logo" className="h-8 w-8" />
              <h2 className="text-2xl font-bold text-yellow-400" style={{ fontFamily: '"Comic Relief", system-ui', fontWeight: 700 }}>ZERO</h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Proof-weighted discovery platform for hackathon projects. Connect, build, and discover innovative solutions.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-6" style={{ fontFamily: '"Comic Relief", system-ui', fontWeight: 700 }}>Platform</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Feed</span>
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Search</span>
                </Link>
              </li>
              <li>
                <Link to="/gallery/hackathon" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Gallery</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-6" style={{ fontFamily: '"Comic Relief", system-ui', fontWeight: 700 }}>Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>About</span>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>FAQ</span>
                </a>
              </li>
              <li>
                <Link to="/investor-plans" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Investor Plans</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-6" style={{ fontFamily: '"Comic Relief", system-ui', fontWeight: 700 }}>Community</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Twitter</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="mailto:support@zero.sh" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center gap-1">
                  <span>Contact</span>
                  <Mail className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-6" style={{ fontFamily: '"Comic Relief", system-ui', fontWeight: 700 }}>Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <hr className="my-8 border-gray-900" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} <span className="text-yellow-400 font-semibold">ZERO</span>. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 group"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 group"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </a>
            <a
              href="mailto:support@0x.ship"
              className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 group"
              aria-label="Email"
            >
              <Mail className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
