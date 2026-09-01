import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { getStats } from '../lib/api';
import type { Stats } from '../lib/types';
import { FileText, ShieldBan, ShieldCheck, Clock, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const Analytics: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const timeSeriesData = [
    { name: 'Mon', threats: 4 },
    { name: 'Tue', threats: 7 },
    { name: 'Wed', threats: 3 },
    { name: 'Thu', threats: 12 },
    { name: 'Fri', threats: 8 },
    { name: 'Sat', threats: 2 },
    { name: 'Sun', threats: 5 },
  ];

  const threatTypeData = [
    { name: 'ROLE_OVERRIDE', value: 15, color: '#ef4444' },
    { name: 'DATA_EXFIL', value: 8, color: '#f97316' },
    { name: 'JAILBREAK', value: 12, color: '#dc2626' },
    { name: 'PROMPT_INJECTION', value: 20, color: '#eab308' },
    { name: 'ENCODING_TRICK', value: 5, color: '#a855f7' },
  ];

  const agentData = [
    { name: 'Pattern', value: 25 },
    { name: 'Semantic', value: 42 },
    { name: 'Context', value: 18 },
  ];

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">System Analytics</h1>
        <p className="text-text-muted">Metrics and trends for VectorGuard protection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Total Files Scanned" value={stats.totalScanned} icon={FileText} color="bg-accent" />
        <MetricCard label="Threats Blocked" value={stats.threatsBlocked} icon={ShieldBan} color="bg-warning" />
        <MetricCard label="Clean Files" value={stats.cleanFiles} icon={ShieldCheck} color="bg-success" />
        <MetricCard label="Avg Scan Time" value={`${stats.avgScanTimeMs}ms`} icon={Clock} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border p-6 rounded-lg">
          <h3 className="font-semibold text-text-primary mb-6">Threats Detected (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f9fafb' }}
                  itemStyle={{ color: '#ef4444' }}
                />
                <Line type="monotone" dataKey="threats" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg">
          <h3 className="font-semibold text-text-primary mb-6">Threat Type Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threatTypeData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
                <XAxis type="number" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f9fafb' }}
                  cursor={{ fill: '#1f2937' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {threatTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg lg:col-span-2">
          <h3 className="font-semibold text-text-primary mb-6">Agent Detection Contribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2937', color: '#f9fafb' }}
                  cursor={{ fill: '#1f2937' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
