import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Globe, MousePointerClick, Activity } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { apiFetch } from '../../services/api';

export const AdminAnalytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const data = await apiFetch('/api/admin/analytics');
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const { topPages = [], totalPageViews = 0, totalSessions = 0, totalUsageMinutes = 0 } = analyticsData || {};
  const avgSessionMins = totalSessions > 0 ? (totalUsageMinutes / totalSessions).toFixed(1) : 0;

  const topPageColumns: Column<any>[] = [
    {
      header: 'Page / Route',
      cell: (row) => <span className="font-semibold text-slate-800">{row.url}</span>,
    },
    {
      header: 'Total Views',
      cell: (row) => (
        <span className="font-extrabold text-[#004990] bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
          {row.views}
        </span>
      ),
    },
    {
      header: 'Traffic Share',
      cell: (row) => {
        const pct = totalPageViews > 0 ? Math.round((row.views / totalPageViews) * 100) : 0;
        return (
          <div className="w-full max-w-[200px] flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-500 w-8">{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Website Usage Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Privacy-first platform engagement tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between text-[#004990] mb-2">
            <Globe className="w-6 h-6" />
            <span className="text-[10px] font-bold bg-blue-50 px-2 py-1 rounded-full border border-blue-100">Total Views</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalPageViews}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Platform Page Views</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <Activity className="w-6 h-6" />
            <span className="text-[10px] font-bold bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">Logins</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{totalSessions}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Total Student Sessions</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <Clock className="w-6 h-6" />
            <span className="text-[10px] font-bold bg-rose-50 px-2 py-1 rounded-full border border-rose-100">Duration</span>
          </div>
          <p className="text-3xl font-black text-slate-900">{avgSessionMins} <span className="text-sm font-semibold text-slate-500">mins</span></p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Avg Session Duration</p>
        </Card>
      </div>

      <Card 
        title={
          <span className="flex items-center gap-2">
            <MousePointerClick className="w-5 h-5 text-indigo-500" />
            Top Visited Pages (Feature Usage)
          </span>
        } 
        subtitle="Identifies drop-off points and most engaged student features"
      >
        <Table columns={topPageColumns} data={topPages} keyExtractor={(r) => r.url} />
      </Card>
    </div>
  );
};
