'use client';

import { useState, useEffect } from 'react';
import { fetchApi } from '../../lib/api';

interface AdminStats {
  totalUsers: number;
  totalActiveLost: number;
  totalActiveFound: number;
  totalClaimed: number;
  totalResolved: number;
  pendingClaims: number;
  pendingHandoffs: number;
  pendingReports: number;
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchApi('/admin/stats');
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="text-sm font-semibold tracking-widest uppercase text-[#555555]">Loading Overview...</div>;
  }

  if (error) {
    return <div className="text-red-500 font-semibold">{error}</div>;
  }

  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Active Lost', value: stats.totalActiveLost },
    { label: 'Active Found', value: stats.totalActiveFound },
    { label: 'Claimed Items', value: stats.totalClaimed },
    { label: 'Resolved Items', value: stats.totalResolved },
    { label: 'Pending Claims', value: stats.pendingClaims },
    { label: 'Pending Handoffs', value: stats.pendingHandoffs },
    { label: 'Pending Reports', value: stats.pendingReports },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-[#111111] uppercase mb-8">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 border border-[#E5E5E5] shadow-sm">
            <h3 className="text-[10px] font-bold tracking-widest uppercase text-[#555555] mb-2">{stat.label}</h3>
            <p className="text-4xl font-bold text-[#111111]">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
