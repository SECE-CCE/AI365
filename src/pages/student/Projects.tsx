import React, { useState, useEffect } from 'react';
import { Plus, Code, Github, ExternalLink } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { StatusPill } from '../../components/common/StatusPill';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { ProjectForm } from '../../components/forms/ProjectForm';
import { apiFetch } from '../../services/api';
import { Project } from '../../types';

export const Projects: React.FC = () => {
  const [data, setData] = useState<{ entries: Project[]; totalApproved: number; target: number }>({
    entries: [],
    totalApproved: 0,
    target: 2,
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await apiFetch('/api/students/projects');
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
    fetchProjects();
    const interval = setInterval(fetchProjects, 5000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchProjects(); };
    const handleFocus = () => fetchProjects();
    const handleUpdated = () => fetchProjects();
    const handleStorage = (e: StorageEvent) => { if (e.key === 'ai365_last_update') fetchProjects(); };

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

  const columns: Column<Project>[] = [
    {
      header: 'Project Title & Stack',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.title}</p>
          <span className="inline-block bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[10px] mt-0.5">
            {row.tech_stack}
          </span>
        </div>
      ),
    },
    {
      header: 'AI Model Contribution',
      cell: (row) => <span className="text-slate-600 text-[11px] line-clamp-2">{row.ai_contribution || row.description}</span>,
    },
    {
      header: 'Links',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          {row.github_link && (
            <a
              href={row.github_link}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs"
              title="GitHub Repository"
            >
              <Github className="w-3.5 h-3.5" />
            </a>
          )}
          {row.demo_link && (
            <a
              href={row.demo_link}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#004990] rounded-lg text-xs"
              title="Live Demo"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
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
      {/* Target Progress Banner */}
      <div className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Code className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">AI / ML Projects</h2>
            <p className="text-xs text-slate-500">Submit working prototypes, GitHub repositories, and AI demos</p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <ProgressBar
            label="Project Target Progress"
            current={data.totalApproved}
            target={data.target}
            unit="projects"
            colorClass="bg-gradient-to-r from-rose-600 to-pink-500"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Submit AI Project</span>
        </button>
      </div>

      {/* Table */}
      <Card
        title="My AI Projects Portfolio"
        subtitle="Manage code repositories and live demo links"
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
          <div className="py-12 text-center text-slate-400">Loading AI projects...</div>
        ) : (
          <Table columns={columns} data={filteredEntries} keyExtractor={(r) => r.id} />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit AI Project"
        subtitle="Provide project details, GitHub repo link, and AI architecture"
      >
        <ProjectForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchProjects();
          }}
        />
      </Modal>
    </div>
  );
};
