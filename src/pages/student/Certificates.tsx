import React, { useState, useEffect } from 'react';
import { Plus, Award, ShieldCheck } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { CertificateForm } from '../../components/forms/CertificateForm';
import { apiFetch } from '../../services/api';
import { Certificate } from '../../types';

export const Certificates: React.FC = () => {
  const [data, setData] = useState<{ entries: Certificate[]; totalApproved: number; target: number }>({
    entries: [],
    totalApproved: 0,
    target: 2,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCertificates = async () => {
    try {
      const res = await apiFetch('/api/students/certificates');
      setData({
        entries: res.entries || [],
        totalApproved: res.totalApproved || 0,
        target: res.target || 2,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    const interval = setInterval(fetchCertificates, 5000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchCertificates(); };
    const handleFocus = () => fetchCertificates();
    const handleUpdated = () => fetchCertificates();
    const handleStorage = (e: StorageEvent) => { if (e.key === 'ai365_last_update') fetchCertificates(); };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('ai365_data_updated', handleUpdated);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('ai365_data_updated', handleUpdated);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const filteredEntries = data.entries.filter((entry) => {
    if (filter === 'All') return true;
    return entry.status.toLowerCase() === filter.toLowerCase();
  });

  const columns: Column<Certificate>[] = [
    {
      header: 'Certificate Title',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[11px] text-[#004990] font-semibold">{row.issuer}</p>
        </div>
      ),
    },
    {
      header: 'Skills Learned',
      cell: (row) => (
        <span className="text-slate-600 font-medium text-[11px] line-clamp-1">{row.skills_learned || 'N/A'}</span>
      ),
    },
    {
      header: 'Issue Date',
      accessorKey: 'completion_date',
    },
    {
      header: 'Certificate PDF',
      cell: (row) =>
        row.certificate_url ? (
          <a
            href={row.certificate_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#004990] hover:underline"
          >
            View Certificate
          </a>
        ) : (
          <span className="text-slate-400">N/A</span>
        ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusPill status={row.status} />,
    },
    {
      header: 'Admin Marks',
      cell: (row) => (
        <span className="text-slate-700 font-semibold">{row.admin_marks !== undefined && row.admin_marks !== null ? row.admin_marks : '-'}</span>
      ),
    },
    {
      header: 'Faculty Remarks',
      cell: (row) => <span className="text-slate-500 italic">{row.faculty_remarks || 'Pending verification'}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Target & Aggregate Progress Banner */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Industry AI Certifications</h2>
            <p className="text-xs text-slate-500">Upload AWS, Google Cloud, NVIDIA, and Microsoft certifications</p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <ProgressBar
            label="Certification Target Progress"
            current={data.totalApproved}
            target={data.target}
            unit="certs"
            colorClass="bg-gradient-to-r from-emerald-600 to-teal-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Certificate</span>
        </button>
      </div>

      {/* Filter Tabs & Data Table */}
      <Card
        title="My Certifications Portfolio"
        subtitle="Submitted certificates and faculty verification status"
        action={
          <div className="flex items-center space-x-2 text-xs">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  filter === status
                    ? 'bg-[#004990] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading certificates...</div>
        ) : (
          <Table columns={columns} data={filteredEntries} keyExtractor={(r) => r.id} />
        )}
      </Card>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Industry Certificate"
        subtitle="Provide certificate details and attach PDF document"
      >
        <CertificateForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchCertificates();
          }}
        />
      </Modal>
    </div>
  );
};
