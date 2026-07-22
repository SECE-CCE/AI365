import React, { useState, useEffect } from 'react';
import { Target, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { apiFetch } from '../../services/api';

export const TargetManagement: React.FC = () => {
  const [targets, setTargets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingYear, setSavingYear] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTargets = async () => {
    try {
      const data = await apiFetch<{ targets: any[] }>('/api/admin/targets');
      setTargets(data.targets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTargets();
  }, []);

  const handleChange = (year: string, field: string, value: number) => {
    setTargets((prev) =>
      prev.map((t) => (t.year === year ? { ...t, [field]: value } : t))
    );
  };

  const handleSave = async (targetObj: any) => {
    setSavingYear(targetObj.year);
    setMessage(null);
    try {
      await apiFetch('/api/admin/targets', {
        method: 'POST',
        body: JSON.stringify(targetObj),
      });
      setMessage(`Academic target for ${targetObj.year} updated successfully!`);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingYear(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          Academic Target Management <Target className="w-6 h-6 text-[#004990]" />
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Define baseline requirements per academic year for the CCE Digital AI Passport
        </p>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading targets...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targets.map((tgt) => (
            <Card
              key={tgt.year}
              title={`${tgt.year} Department Competency Targets`}
              subtitle="Updates student progression progress bars and passport badges"
            >
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Learning Hours (Coursework)</label>
                  <input
                    type="number"
                    value={tgt.target_learning_hours}
                    onChange={(e) => handleChange(tgt.year, 'target_learning_hours', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-[#004990] focus:bg-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Certifications</label>
                    <input
                      type="number"
                      value={tgt.target_certifications}
                      onChange={(e) => handleChange(tgt.year, 'target_certifications', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Research Papers</label>
                    <input
                      type="number"
                      value={tgt.target_research_papers}
                      onChange={(e) => handleChange(tgt.year, 'target_research_papers', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target AI Projects</label>
                    <input
                      type="number"
                      value={tgt.target_projects}
                      onChange={(e) => handleChange(tgt.year, 'target_projects', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-700 focus:bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Target Startups / Patents</label>
                    <input
                      type="number"
                      value={tgt.target_startups}
                      onChange={(e) => handleChange(tgt.year, 'target_startups', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-amber-700 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSave(tgt)}
                    disabled={savingYear === tgt.year}
                    className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2"
                  >
                    {savingYear === tgt.year ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Save {tgt.year} Targets</span>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
