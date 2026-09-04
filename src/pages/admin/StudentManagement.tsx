import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Upload,
  Key,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  ArrowLeft,
  Users,
  Loader2,
  Edit2,
  Save,
  FileUp,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Table, Column } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';

const DEFAULT_BATCHES: Record<string, string> = {
  '1st Year': 'BATCH 2026',
  '2nd Year': 'BATCH 2025',
  '3rd Year': 'BATCH 2024',
  '4th Year': 'BATCH 2023',
};

const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

interface StudentCredentialRow {
  sno: number;
  registrationnumber: string;
  rollno: string;
  name: string;
  username: string;
  password: string;
  phone: string;
  year: string;
}

export const StudentManagement: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable Batch Box Labels
  const [batchLabels, setBatchLabels] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('ai365_batch_labels');
      return saved ? JSON.parse(saved) : DEFAULT_BATCHES;
    } catch (e) {
      return DEFAULT_BATCHES;
    }
  });

  // Edit Batch Modal State
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [editBatchName, setEditBatchName] = useState('');

  // Database Upload / CSV Input States
  const [rawCsvInput, setRawCsvInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Generated Credentials State
  const [generatedList, setGeneratedList] = useState<StudentCredentialRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStudents = async () => {
    try {
      const data = await apiFetch<{ users: any[] }>('/api/admin/users?role=student');
      setAllStudents(data.users || []);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const saveBatchLabels = (updated: Record<string, string>) => {
    setBatchLabels(updated);
    try {
      localStorage.setItem('ai365_batch_labels', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save batch labels to localStorage:', e);
    }
  };

  const handleOpenEditBatch = (e: React.MouseEvent, year: string) => {
    e.stopPropagation();
    setEditingYear(year);
    setEditBatchName(batchLabels[year] || DEFAULT_BATCHES[year]);
  };

  const handleSaveBatch = () => {
    if (!editingYear) return;
    const updated = {
      ...batchLabels,
      [editingYear]: editBatchName.trim() || DEFAULT_BATCHES[editingYear],
    };
    saveBatchLabels(updated);
    setEditingYear(null);
  };

  const getYearCount = (year: string) => {
    const label = (batchLabels[year] || DEFAULT_BATCHES[year] || '').toLowerCase();
    const yearKey = year.split(' ')[0].toLowerCase();
    return allStudents.filter((s) => {
      const sy = (s.year || '').toLowerCase();
      return sy === year.toLowerCase() || sy.includes(yearKey) || (label && sy === label);
    }).length;
  };

  const handleOpenYear = (year: string) => {
    setSelectedYear(year);
    setRawCsvInput('');
    setErrorMsg('');
    setSuccessMsg('');
    setSearchTerm('');

    // Load existing database students for this year
    const yearStudents = allStudents.filter(
      (s) => s.year?.toLowerCase().includes(year.split(' ')[0].toLowerCase()) || s.year === year
    );

    const rows: StudentCredentialRow[] = yearStudents.map((s, index) => {
      const last5 = (s.phone || '12345').replace(/\D/g, '').slice(-5) || '12345';
      return {
        sno: index + 1,
        registrationnumber: s.register_number || `7378241400${index + 1}`,
        rollno: s.register_number || `24CC00${index + 1}`,
        name: s.full_name,
        username: s.email,
        password: `sece@${last5}`,
        phone: s.phone || '',
        year,
      };
    });

    setGeneratedList(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setRawCsvInput(content);
        setSuccessMsg(`Loaded file "${file.name}" into table generator.`);
      }
    };
    reader.readAsText(file);
  };

  const handleParseAndGenerate = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedYear) return;

    if (!rawCsvInput.trim()) {
      return setErrorMsg('Please upload a CSV file or paste raw CSV database text to generate student credentials.');
    }

    setProcessing(true);
    try {
      // Send raw_csv directly to Node.js backend for database provisioning & credential generation
      const response = await apiFetch<{ created: any[]; message: string }>('/api/admin/users/bulk-students', {
        method: 'POST',
        body: JSON.stringify({
          raw_csv: rawCsvInput.trim(),
          year: selectedYear,
        }),
      });

      const createdList = response.created || (response as any).students || [];

      if (createdList.length === 0) {
        setErrorMsg('No student records could be parsed. Check your format or link permissions.');
        return;
      }

      setSuccessMsg(response.message || `Successfully generated credentials for ${createdList.length} students in ${selectedYear}!`);

      // Format rows for table display
      const newGeneratedRows: StudentCredentialRow[] = createdList.map((s: any, index: number) => {
        const cleanPhone = (s.mobileno || s.phone || '12345').replace(/\D/g, '');
        const last5 = cleanPhone.slice(-5) || '12345';
        return {
          sno: s.sno || index + 1,
          registrationnumber: s.registrationnumber || s.register_number || s.rollno || `737824140${index + 1}`,
          rollno: s.rollno || s.register_number || `24CC0${index + 1}`,
          name: s.full_name || s.name,
          username: s.email || s.username,
          password: s.autoPassword || `sece@${last5}`,
          phone: s.phone || s.mobileno || '',
          year: selectedYear,
        };
      });

      setGeneratedList(newGeneratedRows);
      fetchStudents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate student credentials.');
    } finally {
      setProcessing(false);
    }
  };

  const handleExportCsv = () => {
    if (generatedList.length === 0) return;
    let csv = 'S.No,Registration Number,Roll No,Name,Username (Email),Password (Initial)\n';
    generatedList.forEach((s) => {
      csv += `"${s.sno}","${s.registrationnumber}","${s.rollno}","${s.name}","${s.username}","${s.password}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CCE_Student_Credentials_${(selectedYear || 'All').replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  const filteredGeneratedList = generatedList.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.username.toLowerCase().includes(q) ||
      item.rollno.toLowerCase().includes(q) ||
      item.registrationnumber.toLowerCase().includes(q)
    );
  });

  const columns: Column<StudentCredentialRow>[] = [
    {
      header: 'S.No',
      cell: (row) => <span className="font-bold text-slate-700 text-xs">{row.sno}</span>,
    },
    {
      header: 'Registration Number',
      cell: (row) => <span className="font-mono font-semibold text-slate-900 text-xs">{row.registrationnumber}</span>,
    },
    {
      header: 'Roll No',
      cell: (row) => <span className="font-mono font-bold text-[#004990] text-xs">{row.rollno}</span>,
    },
    {
      header: 'Name',
      cell: (row) => <span className="font-bold text-slate-900 text-xs">{row.name}</span>,
    },
    {
      header: 'Username (Official Email)',
      cell: (row) => (
        <span className="font-mono text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.username}
        </span>
      ),
    },
    {
      header: 'Password (sece@last5digits)',
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-700 text-xs bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
          {row.password}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Student Management & Credential Provisioning <GraduationCap className="w-6 h-6 text-[#004990]" />
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage year batch boxes, upload student DB drive links or tables, and auto-generate login credentials.
          </p>
        </div>

        {selectedYear && (
          <button
            onClick={() => setSelectedYear(null)}
            className="self-start sm:self-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Year Selection
          </button>
        )}
      </div>

      {/* 4 Academic Year Boxes Grid (With Editable Batch Labels) */}
      {!selectedYear ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ACADEMIC_YEARS.map((year, index) => {
            const studentCount = getYearCount(year);
            const batchLabel = batchLabels[year] || DEFAULT_BATCHES[year];
            const gradients = [
              'from-blue-600 to-indigo-700',
              'from-purple-600 to-indigo-800',
              'from-emerald-600 to-teal-800',
              'from-amber-500 to-orange-700',
            ];

            return (
              <div
                key={year}
                onClick={() => handleOpenYear(year)}
                className="group relative bg-white rounded-[24px] shadow-lg border border-slate-200/80 p-6 hover:shadow-2xl hover:border-[#004990] transition-all cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${gradients[index % gradients.length]}`} />

                <div>
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#004990] group-hover:bg-[#004990] group-hover:text-white flex items-center justify-center font-black text-lg transition-all shadow-inner shrink-0">
                      {index + 1}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-[10px] uppercase tracking-wider border border-slate-200">
                        {batchLabel}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditBatch(e, year)}
                        className="p-1 text-slate-400 hover:text-[#004990] hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Batch Label"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 group-hover:text-[#004990] transition-colors">
                    {year}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Computer & Communication Engineering
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{studentCount} Student Details</span>
                  </div>
                  <span className="text-xs font-bold text-[#004990] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0">
                    Open Box →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Selected Year Management View */
        <div className="space-y-6">
          {/* Year Title Banner */}
          <div className="bg-gradient-to-r from-[#001E42] via-[#002B5C] to-[#004990] text-white p-6 rounded-[24px] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 bg-white/10 text-[#F3B631] font-bold text-[10px] uppercase tracking-wider rounded-full border border-white/10 mb-2 inline-block">
                {batchLabels[selectedYear] || DEFAULT_BATCHES[selectedYear]}
              </span>
              <h3 className="text-2xl font-black">{selectedYear} — Student Database & Credentials</h3>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Upload CSV files or paste database records to provision student credentials for this batch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/10">
                {generatedList.length} Student Details Loaded
              </span>
            </div>
          </div>

          {/* Database Input & Credentials Generator Form */}
          <Card title="Upload Student Database CSV File" subtitle="Upload a CSV file or paste database table text (sno, rollno, registrationnumber, name, mobileno, email)">
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Primary Option: File Upload & Raw CSV Data */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <label className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#004990]" /> Student Database File Upload / CSV Input
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Required columns: <code className="bg-slate-200/70 px-1.5 py-0.5 rounded text-slate-800 font-mono">sno, rollno, registrationnumber, name, mobileno, email</code>
                    </p>
                  </div>

                  <label className="cursor-pointer px-4 py-2 bg-[#004990] hover:bg-[#002B5C] text-white border border-blue-900 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto">
                    <FileUp className="w-4 h-4" /> Browse & Upload CSV File
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Paste CSV Data Text directly:
                  </label>
                  <textarea
                    rows={5}
                    value={rawCsvInput}
                    onChange={(e) => setRawCsvInput(e.target.value)}
                    placeholder={`sno, rollno, registrationnumber, name, mobileno, email\n1, 24CC001, 73782414001, Alex Mercer, 9876543210, alex.m@sece.ac.in\n2, 24CC002, 73782414002, Bella Swan, 9876543211, bella.s@sece.ac.in`}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 focus:border-[#004990] outline-none font-mono text-xs leading-relaxed"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleParseAndGenerate}
                disabled={processing}
                className="w-full sm:w-auto px-6 py-3 bg-[#004990] hover:bg-[#002B5C] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Key className="w-4 h-4 text-[#F3B631]" />
                    <span>Generate Username & Password Box (All Students)</span>
                  </>
                )}
              </button>
            </div>
          </Card>

          {/* Generated Student Credentials Table */}
          <Card
            title={`Generated Student Credentials (${generatedList.length})`}
            subtitle={`List containing S.No, Registration Number, Roll No, Username (@sece.ac.in), and Password for ${selectedYear}`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 text-xs">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student name, roll number, registration number, username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={generatedList.length === 0}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Export Credentials CSV
              </button>
            </div>

            {filteredGeneratedList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs font-medium">
                No generated student credentials found for this year. Paste a Drive link or CSV table above to generate records.
              </div>
            ) : (
              <Table columns={columns} data={filteredGeneratedList} keyExtractor={(r) => `${r.sno}-${r.username}`} />
            )}
          </Card>
        </div>
      )}

      {/* Edit Batch Modal */}
      <Modal
        isOpen={!!editingYear}
        onClose={() => setEditingYear(null)}
        title={`Edit Batch Label — ${editingYear}`}
        subtitle="Customize the batch box title displayed on the dashboard"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Batch Label Name *</label>
            <input
              type="text"
              value={editBatchName}
              onChange={(e) => setEditBatchName(e.target.value)}
              placeholder="e.g. BATCH 2026, BATCH 2024-2028, CCE-B1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none font-bold text-slate-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              onClick={() => setEditingYear(null)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBatch}
              className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Batch Label
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
