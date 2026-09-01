import React from 'react';
import type { ScanResult } from '../lib/types';
import { ThreatBadge } from './ThreatBadge';
import { ShieldCheck, ShieldAlert, Clock, Layers, ShieldBan } from 'lucide-react';

interface ScanResultPanelProps {
  result: ScanResult;
}

export const ScanResultPanel: React.FC<ScanResultPanelProps> = ({ result }) => {
  const isClean = result.status === 'clean' || result.threats.length === 0;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 animate-in slide-in-from-bottom-4 duration-500 fade-in">
      {/* Banner */}
      <div className={`p-4 rounded-t-lg flex items-center gap-3 ${isClean ? 'bg-success/20 border-success/30 border-b-0 border' : 'bg-danger/20 border-danger/30 border-b-0 border'}`}>
        {isClean ? <ShieldCheck className="w-8 h-8 text-success" /> : <ShieldAlert className="w-8 h-8 text-danger" />}
        <div>
          <h2 className={`text-lg font-bold ${isClean ? 'text-success' : 'text-danger'}`}>
            {isClean ? '✓ File is Clean' : '⚠ Threats Detected & Neutralized'}
          </h2>
          <p className="text-sm text-text-muted">File: {result.filename}</p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="bg-surface border border-border p-4 flex justify-between items-center text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          <span>{result.total_chunks} chunks scanned</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldBan className="w-4 h-4 text-warning" />
          <span>{result.threats.length} threats blocked</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{result.scan_duration_ms}ms scan time</span>
        </div>
      </div>

      {/* Threats List */}
      {!isClean && (
        <div className="bg-background border-x border-b border-border p-6 space-y-4 rounded-b-lg">
          <h3 className="font-semibold text-text-primary mb-4">Detected Threats</h3>
          <div className="space-y-4">
            {result.threats.map((threat, idx) => (
              <div key={idx} className="bg-surface border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <ThreatBadge threatType={threat.threat_type} confidence={threat.confidence} />
                  <span className="text-xs text-text-muted uppercase font-semibold">Agent: {threat.agent_source}</span>
                </div>
                <div className="bg-background border border-danger/30 rounded p-3 relative">
                  <p className="text-sm text-text-primary font-mono whitespace-pre-wrap">
                    {threat.original_span}
                  </p>
                  <div className="absolute inset-0 bg-danger/10 pointer-events-none rounded"></div>
                </div>
                <div className="mt-3 w-full bg-background rounded-full h-1.5">
                  <div 
                    className="bg-danger h-1.5 rounded-full" 
                    style={{ width: `${threat.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold text-text-primary mb-2">Sanitized Text Preview</h3>
            <div className="bg-surface p-4 rounded-lg border border-border max-h-64 overflow-y-auto">
              <p className="text-sm text-text-muted whitespace-pre-wrap">{result.sanitized_text}</p>
            </div>
          </div>
        </div>
      )}
      
      {isClean && (
        <div className="bg-background border-x border-b border-border p-6 rounded-b-lg">
           <div className="bg-surface p-4 rounded-lg border border-border">
              <p className="text-sm text-text-muted whitespace-pre-wrap">{result.sanitized_text}</p>
            </div>
        </div>
      )}
    </div>
  );
};
