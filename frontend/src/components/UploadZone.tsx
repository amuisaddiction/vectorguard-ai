import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react';
import { scanFile } from '../lib/api';
import type { ScanResult } from '../lib/types';

interface UploadZoneProps {
  onScanComplete: (result: ScanResult) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onScanComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFile = async (file: File) => {
    if (!file) return;

    const allowedExtensions = ['.txt', '.md', '.pdf', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      setStatus('error');
      setErrorMsg('Unsupported file format. Please use .txt, .md, .pdf, or .csv');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setErrorMsg('File size exceeds 5MB limit.');
      return;
    }

    setStatus('scanning');
    setErrorMsg('');
    
    try {
      const result = await scanFile(file);
      onScanComplete(result);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'An error occurred during scanning.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  if (status === 'scanning') {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8 bg-surface border border-border rounded-xl p-12 text-center animate-in fade-in duration-300">
        <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-text-primary">Scanning with 3 AI agents...</h3>
        <p className="text-text-muted mt-2">Evaluating semantics, patterns, and context</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      {status === 'error' && (
        <div className="mb-4 bg-danger/20 border border-danger/50 text-danger p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
          <button 
            onClick={() => setStatus('idle')}
            className="text-sm bg-danger/20 hover:bg-danger/30 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      <div 
        className={`bg-surface border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer relative overflow-hidden
          ${isDragging ? 'border-accent bg-accent/10 scale-[1.02] shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-border hover:border-accent/50 hover:bg-surface/80'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className={`w-16 h-16 mx-auto mb-4 transition-colors duration-300 ${isDragging ? 'text-accent' : 'text-text-muted'}`} />
        <h3 className="text-xl font-bold text-text-primary mb-2">
          🛡️ Drop your file here to scan
        </h3>
        <p className="text-text-muted mb-6">
          Supported: .txt .md .pdf .csv (Max 5MB)
        </p>
        <div className="flex flex-col items-center gap-2">
          <button className="bg-background border border-border hover:bg-border text-text-primary px-6 py-2 rounded-md font-medium transition-colors">
            Browse Files
          </button>
          <span className="text-xs text-text-muted font-medium">Or press 'U' anywhere</span>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".txt,.md,.pdf,.csv" 
        />
      </div>
    </div>
  );
};
