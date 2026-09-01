import React, { useState, useEffect } from 'react';
import { UploadZone } from '../components/UploadZone';
import { ScanResultPanel } from '../components/ScanResultPanel';
import type { ScanResult } from '../lib/types';
import { runDemoScan } from '../lib/api';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

export const Home: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleDemo = async () => {
      setScanResult(null);
      setToast(null);
      const result = await runDemoScan();
      setScanResult(result);
      if (result.status === 'clean' || result.threats.length === 0) {
        setToast({ message: 'File scanned successfully — no threats detected', type: 'success' });
      } else {
        setToast({ message: '⚠️ Threats detected and neutralized', type: 'error' });
      }
    };

    window.addEventListener('run-demo-scan', handleDemo as EventListener);
    return () => window.removeEventListener('run-demo-scan', handleDemo as EventListener);
  }, []);

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    if (result.status === 'clean' || result.threats.length === 0) {
      setToast({ message: 'File scanned successfully — no threats detected', type: 'success' });
    } else {
      setToast({ message: '⚠️ Threats detected and neutralized', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-text-primary mb-4 tracking-tight">
          Secure Your Vector Pipelines
        </h1>
        <p className="text-xl text-text-muted max-w-2xl mx-auto">
          Intercept prompt injections and data poisoning before they reach your embedding models.
        </p>
      </div>

      {!scanResult ? (
        <UploadZone onScanComplete={handleScanComplete} />
      ) : (
        <div className="flex flex-col items-center">
          <ScanResultPanel result={scanResult} />
          <button 
            onClick={() => setScanResult(null)}
            className="mt-8 text-accent hover:text-accent/80 font-medium transition-colors"
          >
            Scan another file
          </button>
        </div>
      )}

      <div className="mt-24 max-w-3xl mx-auto">
        <h3 className="text-lg font-bold text-text-primary mb-6 text-center uppercase tracking-widest text-text-muted">
          How VectorGuard Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'Ingest', desc: 'File enters pipeline' },
            { step: '2', title: 'Pattern Scan', desc: 'Agent 1 heuristics' },
            { step: '3', title: 'Semantic Eval', desc: 'Agent 2 LLM zero-shot' },
            { step: '4', title: 'Context Analyze', desc: 'Agent 3 cross-chunk' },
            { step: '5', title: 'Sanitize', desc: 'Threats redacted' },
          ].map((item, idx) => (
            <div key={idx} className="bg-surface border border-border hover:border-accent/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] rounded-lg p-4 text-center transition-all duration-300 hover:-translate-y-1 cursor-default group">
              <div className="w-8 h-8 mx-auto bg-background group-hover:bg-accent/10 rounded-full flex items-center justify-center font-bold text-accent mb-2 transition-colors duration-300">
                {item.step}
              </div>
              <h4 className="font-semibold text-text-primary text-sm">{item.title}</h4>
              <p className="text-xs text-text-muted mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-bottom-4 z-50 ${
          toast.type === 'success' ? 'bg-success/90 border-success text-white' : 'bg-danger/90 border-danger text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="font-medium text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-75 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
