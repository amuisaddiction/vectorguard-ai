import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Play } from 'lucide-react';
import { getHealth } from '../lib/api';

export const Navbar: React.FC = () => {
  const [isHealthy, setIsHealthy] = useState(false);
  const location = useLocation();

  useEffect(() => {
    getHealth().then(res => {
      setIsHealthy(res.status === 'healthy' || res.status === 'ok');
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
    <nav className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <ShieldCheck className="w-8 h-8 text-accent group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold text-xl text-text-primary tracking-tight">VectorGuard AI</span>
            </Link>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'bg-accent/10 text-accent shadow-[0_0_10px_rgba(59,130,246,0.2)]'
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
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)]"
            >
              <Play className="w-4 h-4" />
              Run Demo
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-full border border-border">
              <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-success animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-danger'}`}></div>
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
