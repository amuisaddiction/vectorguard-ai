import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Play } from 'lucide-react';
import { getHealth } from '../lib/api';

export const Navbar: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getHealth().then(res => {
      setIsHealthy(res.status === 'ok');
    }).catch(() => {
      setIsHealthy(false);
    });
  }, []);

  const handleRunDemo = () => {
    const event = new CustomEvent('run-demo-scan');
    window.dispatchEvent(event);
  };

  const navLinks = [
    { name: 'Upload', path: '/' },
    { name: 'Alerts', path: '/alerts' },
    { name: 'Analytics', path: '/analytics' },
  ];

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-accent" />
              <span className="font-bold text-xl text-text-primary tracking-tight">VectorGuard AI</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'bg-background text-accent'
                        : 'text-text-muted hover:bg-background hover:text-text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRunDemo}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Run Demo
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-full border border-border">
              <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-success' : 'bg-danger'}`}></div>
              <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {isHealthy ? 'System Online' : 'System Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
