import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, color = 'bg-accent' }) => {
  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex items-center shadow-sm relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${color}`}></div>
      <div className="ml-2 flex-1">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text-primary mt-1">{value}</p>
      </div>
      <div className="p-3 bg-background rounded-full">
        <Icon className="w-6 h-6 text-text-muted" />
      </div>
    </div>
  );
};
