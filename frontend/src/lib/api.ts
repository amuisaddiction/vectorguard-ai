import type { ScanResult, Alert, Stats, HealthStatus } from './types';
import { mockScanResult, mockAlerts, mockStats, mockHealth } from './mock-data';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export async function scanFile(file: File): Promise<ScanResult> {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return mockScanResult(file.name);
  }

  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/scan`, { 
    method: "POST", 
    body: formData 
  });
  
  if (!res.ok) {
    throw new Error(`Scan failed: ${res.statusText}`);
  }
  
  return res.json();
}

export async function runDemoScan(): Promise<ScanResult> {
  // Always run mock for the demo button since we need guaranteed results
  await new Promise(resolve => setTimeout(resolve, 1500));
  return mockScanResult("demo_poisoned_file.txt");
}

export async function getAlerts(limit = 50, offset = 0): Promise<Alert[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAlerts();
  }

  const res = await fetch(`${API_BASE}/api/alerts?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function getStats(): Promise<Stats> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockStats();
  }

  // Assuming backend has this endpoint, else fall back to mock
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  } catch (e) {
    console.warn("Backend /api/stats failed, using mock data");
    return mockStats();
  }
}

export async function getHealth(): Promise<HealthStatus> {
  if (USE_MOCK) {
    return mockHealth();
  }

  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  } catch (e) {
    return {
      status: "offline",
      agents: []
    };
  }
}
