import React, { useState, useEffect } from 'react';
import { BarChart3, Download, Users, Award, FileText, Code } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { apiFetch } from '../../services/api';

export const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const data = await apiFetch('/api/admin/reports');
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const yearlyBreakdown = reportData?.yearlyBreakdown || [];

  const columns: Column<any>[] = [
    {
      header: 'Academic Year',
      cell: (row) => <span className="font-extrabold text-[#004990]">{row.year}</span>,
    },
    {
      header: 'Student Count',
      accessorKey: 'studentCount',
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Total Learning Hours',
      cell: (row) => <span className="font-bold text-slate-800">{row.totalHours} hrs</span>,
    },
    {
      header: 'Verified Certs',
      accessorKey: 'totalCerts',
    },
    {
      header: 'Research Papers',
      accessorKey: 'totalPapers',
    },
    {
      header: 'AI Projects',
      accessorKey: 'totalProjects',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CCE Departmental Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Full academic year metrics and AI activity progression</p>
        </div>
      </div>

      <Card title="Year-Wise AI Performance Breakdown" subtitle="Department totals across batch cohorts">
        <Table columns={columns} data={yearlyBreakdown} keyExtractor={(r) => r.year} />
      </Card>
    </div>
  );
};
