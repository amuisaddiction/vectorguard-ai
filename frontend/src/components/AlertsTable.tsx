import React, { useState } from 'react';
import type { Alert } from '../lib/types';
import { ThreatBadge } from './ThreatBadge';
import { Download, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

interface AlertsTableProps {
  alerts: Alert[];
}

export const AlertsTable: React.FC<AlertsTableProps> = ({ alerts }) => {
  const [sortField, setSortField] = useState<keyof Alert>('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const handleSort = (field: keyof Alert) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
    setCurrentPage(1);
  };

  const filteredAlerts = filterType === 'ALL' 
    ? alerts 
    : alerts.filter(a => a.threat_type === filterType);

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortAsc ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedAlerts.length / itemsPerPage) || 1;
  const paginatedAlerts = sortedAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportCSV = () => {
    const headers = ['Timestamp', 'File ID', 'Threat Type', 'Agent', 'Confidence', 'Action'];
    const rows = sortedAlerts.map(a => [
      a.timestamp,
      a.file_id,
      a.threat_type,
      a.agent_source,
      a.confidence.toString(),
      a.action_taken
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'vectorguard_alerts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const threatTypes = ['ALL', ...Array.from(new Set(alerts.map(a => a.threat_type)))];

  const SortIcon = ({ field }: { field: keyof Alert }) => {
    if (sortField !== field) return <span className="opacity-0 group-hover:opacity-50"><ChevronDown className="w-4 h-4 inline" /></span>;
    return sortAsc ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />;
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border flex justify-between items-center bg-background">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-text-primary">Security Alerts</h2>
          <select 
            value={filterType} 
            onChange={handleFilterChange}
            className="bg-surface border border-border text-text-primary text-sm rounded-md px-2 py-1 focus:outline-none focus:border-accent"
          >
            {threatTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 text-sm text-text-primary bg-surface border border-border hover:bg-border px-3 py-1.5 rounded-md transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-text-muted">
          <thead className="bg-background/50 border-b border-border text-xs uppercase text-text-muted">
            <tr>
              <th className="px-6 py-3 cursor-pointer group hover:text-text-primary" onClick={() => handleSort('timestamp')}>
                Timestamp <SortIcon field="timestamp" />
              </th>
              <th className="px-6 py-3 cursor-pointer group hover:text-text-primary" onClick={() => handleSort('file_id')}>
                File <SortIcon field="file_id" />
              </th>
              <th className="px-6 py-3 cursor-pointer group hover:text-text-primary" onClick={() => handleSort('threat_type')}>
                Threat Type <SortIcon field="threat_type" />
              </th>
              <th className="px-6 py-3 cursor-pointer group hover:text-text-primary" onClick={() => handleSort('agent_source')}>
                Agent <SortIcon field="agent_source" />
              </th>
              <th className="px-6 py-3 cursor-pointer group hover:text-text-primary" onClick={() => handleSort('confidence')}>
                Confidence <SortIcon field="confidence" />
              </th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">No alerts found for this filter.</td>
              </tr>
            ) : (
              paginatedAlerts.map(alert => (
                <tr key={alert.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(alert.timestamp).toLocaleString()}</td>
                  <td className="px-6 py-4 font-mono text-xs">{alert.file_id}</td>
                  <td className="px-6 py-4"><ThreatBadge threatType={alert.threat_type} confidence={alert.confidence} /></td>
                  <td className="px-6 py-4">{alert.agent_source}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-background rounded-full h-1.5 max-w-[4rem]">
                      <div 
                        className={`h-1.5 rounded-full ${alert.confidence > 0.8 ? 'bg-danger' : alert.confidence > 0.5 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${alert.confidence * 100}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded text-xs uppercase bg-surface border border-border">
                      {alert.action_taken}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="p-4 bg-background border-t border-border flex items-center justify-between">
        <span className="text-sm text-text-muted">
          Showing {Math.min(sortedAlerts.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(sortedAlerts.length, currentPage * itemsPerPage)} of {sortedAlerts.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-surface border border-border hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-text-primary" />
          </button>
          <span className="text-sm font-medium text-text-primary px-2">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-surface border border-border hover:bg-border disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};
