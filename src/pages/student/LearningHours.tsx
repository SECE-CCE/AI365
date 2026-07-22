import React, { useState, useEffect } from 'react';
import { Plus, Clock, Target, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { LearningHoursForm } from '../../components/forms/LearningHoursForm';
import { apiFetch } from '../../services/api';
import { LearningHour } from '../../types';

export const LearningHours: React.FC = () => {
  const [data, setData] = useState<{ entries: LearningHour[]; totalApproved: number; target: number }>({
    entries: [],
    totalApproved: 0,
    target: 100,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchHours = async () => {
    try {
      const res = await apiFetch('/api/students/learning-hours');
      setData({
        entries: res.entries || [],
        totalApproved: res.totalApproved || 0,
        target: res.target || 100,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHours();
  }, []);

  const filteredEntries = data.entries.filter((entry) => {
    if (filter === 'All') return true;
    return entry.status.toLowerCase() === filter.toLowerCase();
  });

  const columns: Column<LearningHour>[] = [
    {
      header: 'Activity Name',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.activity_name}</p>
          <p className="text-[11px] text-slate-500">{row.platform}</p>
        </div>
      ),
    },
    {
      header: 'Hours Logged',
      cell: (row) => <span className="font-bold text-[#004990]">{row.hours} hrs</span>,
    },
    {
      header: 'Date Completed',
      accessorKey: 'date',
    },
    {
      header: 'Proof Document',
      cell: (row) =>
        row.certificate_url ? (
          <a
            href={row.certificate_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#004990] hover:underline"
          >
            View Document PDF
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
      cell: (row) => <span className="text-slate-500 italic">{row.faculty_remarks || 'Pending evaluation'}</span>,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Target & Aggregate Progress Banner */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#004990] flex items-center justify-center shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">AI Learning Hours Tracker</h2>
            <p className="text-xs text-slate-500">Log verified course hours from Coursera, NPTEL, and NVIDIA DLI</p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <ProgressBar
            label="Academic Year Progress"
            current={data.totalApproved}
            target={data.target}
            unit="hrs"
            colorClass="bg-gradient-to-r from-[#004990] to-blue-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Log Learning Hours</span>
        </button>
      </div>

      {/* Filter Tabs & Data Table */}
      <Card
        title="Learning Hours Log"
        subtitle="Manage and view status of logged AI activities"
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
          <div className="py-12 text-center text-slate-400">Loading entries...</div>
        ) : (
          <Table columns={columns} data={filteredEntries} keyExtractor={(r) => r.id} />
        )}
      </Card>

      {/* Modal Form for Submission */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log AI Learning Hours"
        subtitle="Submit completed online courses or workshop hours for mentor verification"
      >
        <LearningHoursForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchHours();
          }}
        />
      </Modal>
    </div>
  );
};
