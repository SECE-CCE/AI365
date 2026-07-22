import React, { useState } from 'react';
import { Upload, Loader2, CheckCircle } from 'lucide-react';
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
  const [imageUrl, setImageUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await apiFetch<{ url: string }>('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, type: 'project' }),
      });
      setImageUrl(res.url);
    } catch (err) {
      setError('Failed to upload project screenshot.');
    } finally {
      setUploading(false);
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
        body: JSON.stringify({
          title,
          description,
          github_link: githubLink,
          demo_link: demoLink,
          tech_stack: techStack,
          ai_contribution: aiContribution,
          image_url: imageUrl,
        }),
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
      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block font-bold text-slate-700 mb-1">Project Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. NeuralSight — Real-Time AI Traffic Signal Synthesizer"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Project Overview & Objectives *</label>
        <textarea
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain problem statement, architecture, system design, and practical outcomes..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">GitHub Repository Link</label>
          <input
            type="url"
            value={githubLink}
            onChange={(e) => setGithubLink(e.target.value)}
            placeholder="https://github.com/username/project"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Live Demo / App URL</label>
          <input
            type="url"
            value={demoLink}
            onChange={(e) => setDemoLink(e.target.value)}
            placeholder="https://my-ai-app.cce.edu"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Tech Stack Used *</label>
        <input
          type="text"
          required
          value={techStack}
          onChange={(e) => setTechStack(e.target.value)}
          placeholder="e.g. PyTorch, OpenCV, React, FastAPI, Docker, MQTT"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">AI / ML Model Contribution</label>
        <input
          type="text"
          value={aiContribution}
          onChange={(e) => setAiContribution(e.target.value)}
          placeholder="e.g., Custom trained YOLOv8 model with 94.2% mAP on campus dataset"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Project Banner / Architecture Diagram</label>
        <div className="flex items-center space-x-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#004990]" /> : <Upload className="w-4 h-4" />}
            <span>{uploading ? 'Uploading Image...' : 'Choose Image'}</span>
            <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
          </label>
          {imageUrl && (
            <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" /> Image Attached
            </span>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>Submit AI Project</span>
        </button>
      </div>
    </form>
  );
};
