import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { ResearchForm } from '../../components/forms/ResearchForm';
import { apiFetch } from '../../services/api';
import { ResearchPaper } from '../../types';

export const Research: React.FC = () => {
  const [data, setData] = useState<{ entries: ResearchPaper[]; totalApproved: number; target: number }>({
    entries: [],
    totalApproved: 0,
    target: 1,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchResearch = async () => {
    try {
      const res = await apiFetch('/api/students/research');
      setData({
        entries: res.entries || [],
        totalApproved: res.totalApproved || 0,
        target: res.target || 1,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResearch();
    const interval = setInterval(fetchResearch, 5000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchResearch(); };
    const handleFocus = () => fetchResearch();
    const handleUpdated = () => fetchResearch();
    const handleStorage = (e: StorageEvent) => { if (e.key === 'ai365_last_update') fetchResearch(); };

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

  const columns: Column<ResearchPaper>[] = [
    {
      header: 'Paper Title',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <p className="text-[11px] text-[#004990] font-semibold">{row.conference_journal}</p>
        </div>
      ),
    },
    {
      header: 'Authors',
      accessorKey: 'authors',
      className: 'font-medium text-slate-700',
    },
    {
      header: 'Abstract',
      cell: (row) => <span className="text-slate-600 text-[11px] line-clamp-2">{row.abstract || 'N/A'}</span>,
    },
    {
      header: 'Manuscript PDF',
      cell: (row) =>
        row.pdf_url ? (
          <a
            href={row.pdf_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#004990] hover:underline"
          >
            Download PDF
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
      header: 'Faculty Remarks',
      cell: (row) => <span className="text-slate-500 italic">{row.faculty_remarks || 'Pending review'}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Target Progress Banner */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Research & Publications</h2>
            <p className="text-xs text-slate-500">Track IEEE, Springer, and Scopus conference manuscripts</p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <ProgressBar
            label="Research Target Progress"
            current={data.totalApproved}
            target={data.target}
            unit="papers"
            colorClass="bg-gradient-to-r from-indigo-600 to-purple-600"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Paper</span>
        </button>
      </div>

      {/* Table */}
      <Card
        title="Submitted Research Papers"
        subtitle="Conference & journal publications submitted for faculty endorsement"
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
          <div className="py-12 text-center text-slate-400">Loading research papers...</div>
        ) : (
          <Table columns={columns} data={filteredEntries} keyExtractor={(r) => r.id} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Research Paper"
        subtitle="Submit manuscript PDF and details for faculty evaluation"
      >
        <ResearchForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchResearch();
          }}
        />
      </Modal>
    </div>
  );
};
