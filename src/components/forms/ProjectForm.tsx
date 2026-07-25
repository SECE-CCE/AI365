import React, { useState } from 'react';
import { Link, Loader2, CheckCircle, ExternalLink, Info } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface ProjectFormProps {
  onSuccess: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [githubLink, setGithubLink] = useState('');
  const [demoLink, setDemoLink] = useState('');
  const [techStack, setTechStack] = useState('');
  const [aiContribution, setAiContribution] = useState('');
  const [driveLink, setDriveLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleValidateLink = async () => {
    if (!driveLink.trim()) return setError('Please paste your Google Drive link first.');
    setError('');
    setValidating(true);
    try {
      const res = await apiFetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ driveLink }),
      });
      setImageUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Invalid Drive link. Make sure sharing is set to "Anyone with link".');
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) return setError('Project Title is required.');
    if (!description.trim()) return setError('Description is required.');
    if (!techStack.trim()) return setError('Tech Stack is required.');

    setSubmitting(true);
    try {
      await apiFetch('/api/students/projects', {
        method: 'POST',
        body: JSON.stringify({ title, description, github_link: githubLink, demo_link: demoLink, tech_stack: techStack, ai_contribution: aiContribution, image_url: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600' }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit AI project.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {error && <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">{error}</div>}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Project Title *</label>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. NeuralSight — Real-Time AI Traffic Signal Synthesizer"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Project Overview & Objectives *</label>
        <textarea rows={3} required value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain problem statement, architecture, system design, and practical outcomes..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">GitHub Repository Link</label>
          <input type="url" value={githubLink} onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
        </div>
        <div>
          <label className="block font-bold text-slate-700 mb-1">Live Demo / App URL</label>
          <input type="url" value={demoLink} onChange={(e) => setDemoLink(e.target.value)}
            placeholder="https://my-ai-app.cce.edu"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Tech Stack Used *</label>
        <input type="text" required value={techStack} onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. PyTorch, OpenCV, React, FastAPI, Docker, MQTT"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">AI / ML Model Contribution</label>
        <input type="text" value={aiContribution} onChange={(e) => setAiContribution(e.target.value)}
          placeholder="e.g., Custom trained YOLOv8 model with 94.2% mAP on campus dataset"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
      </div>

      {/* Google Drive Link Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-blue-700 leading-relaxed">
          Upload your project report/screenshot to <strong>Google Drive</strong>, right-click → <strong>Share</strong> → set to <strong>"Anyone with the link can view"</strong>, then paste the link below. (Optional)
        </p>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Google Drive Project Report / Screenshot (Optional)</label>
        <div className="flex gap-2">
          <input type="url" value={driveLink} onChange={(e) => { setDriveLink(e.target.value); setImageUrl(''); }}
            placeholder="https://drive.google.com/file/d/..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all" />
          <button type="button" onClick={handleValidateLink} disabled={validating || !driveLink.trim()}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-900 text-white rounded-xl font-semibold flex items-center gap-1.5 disabled:opacity-50 shrink-0">
            {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
            Validate
          </button>
        </div>
        {imageUrl && (
          <div className="mt-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-emerald-700 font-semibold">Link validated!</span>
            <a href={imageUrl} target="_blank" rel="noreferrer" className="text-[#004990] hover:underline flex items-center gap-1">
              Preview <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={submitting}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Submit AI Project
        </button>
      </div>
    </form>
  );
};
