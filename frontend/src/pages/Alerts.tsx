import React, { useEffect, useState } from 'react';
import { AlertsTable } from '../components/AlertsTable';
import { getAlerts } from '../lib/api';
import type { Alert } from '../lib/types';
import { Loader2 } from 'lucide-react';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAlerts()
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Security Alerts Log</h1>
        <p className="text-text-muted">Review all detected and neutralized threats.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : (
        <AlertsTable alerts={alerts} />
      )}
    </div>
  );
};
