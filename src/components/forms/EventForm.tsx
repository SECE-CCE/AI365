import React, { useState, useEffect } from 'react';
import { Upload, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { EventItem } from '../../types';

interface EventFormProps {
  onSuccess: () => void;
  initialData?: EventItem | null;
}

export const EventForm: React.FC<EventFormProps> = ({ onSuccess, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [venue, setVenue] = useState(initialData?.venue || '');
  const [eventDate, setEventDate] = useState(initialData?.event_date || '');
  const [eventTime, setEventTime] = useState(initialData?.event_time || '10:00 AM');
  const [maxParticipants, setMaxParticipants] = useState(String(initialData?.max_participants || '100'));
  const [category, setCategory] = useState(initialData?.category || 'Workshop');
  const [posterUrl, setPosterUrl] = useState(initialData?.poster_url || '');

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setVenue(initialData.venue || '');
      setEventDate(initialData.event_date || '');
      setEventTime(initialData.event_time || '10:00 AM');
      setMaxParticipants(String(initialData.max_participants || 100));
      setCategory(initialData.category || 'Workshop');
      setPosterUrl(initialData.poster_url || '');
    }
  }, [initialData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      try {
        const res = await apiFetch<{ url: string }>('/api/upload/poster', {
          method: 'POST',
          body: JSON.stringify({ imageBase64: base64, title }),
        });
        if (res?.url) {
          setPosterUrl(res.url);
        } else {
          setPosterUrl(base64);
        }
      } catch {
        setPosterUrl(base64);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file.');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) return setError('Event title is required.');
    if (!venue.trim()) return setError('Venue is required.');
    if (!eventDate) return setError('Event date is required.');

    setSubmitting(true);
    try {
      const isEdit = !!initialData?.id;
      const url = isEdit ? `/api/events/${initialData.id}` : '/api/events';
      const method = isEdit ? 'PUT' : 'POST';

      await apiFetch(url, {
        method,
        body: JSON.stringify({
          title,
          description,
          venue,
          event_date: eventDate,
          event_time: eventTime,
          max_participants: Number(maxParticipants),
          category,
          poster_url: posterUrl || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
        }),
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save event.');
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
        <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. CCE National AI & Robotics Hackathon 2026"
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          >
            <option value="Workshop">Workshop</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Seminar">Seminar</option>
            <option value="Symposium">Symposium</option>
            <option value="Competition">Competition</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Venue *</label>
          <input
            type="text"
            required
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. CCE Innovation Lab / Auditorium 1"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Event Date *</label>
          <input
            type="date"
            required
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Start Time *</label>
          <input
            type="text"
            required
            value={eventTime}
            onChange={(e) => setEventTime(e.target.value)}
            placeholder="09:30 AM"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Max Seats</label>
          <input
            type="number"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Description & Agenda</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event highlights, prerequisites, speakers, and schedule..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#004990] outline-none transition-all"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 mb-1">Upload Event Poster / Banner</label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold border border-slate-200 transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin text-[#004990]" /> : <Upload className="w-4 h-4" />}
              <span>{uploading ? 'Uploading Poster...' : 'Choose Image'}</span>
              <input type="file" onChange={handleFileUpload} accept="image/*" className="hidden" />
            </label>
            {posterUrl && (
              <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5" /> Poster Attached
              </span>
            )}
          </div>

          {posterUrl && (
            <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
              <img src={posterUrl} alt="Poster Preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white rounded text-[10px] font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-[#F3B631]" /> Banner Preview
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-semibold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          <span>{initialData?.id ? 'Update CCE Event' : 'Publish CCE Event'}</span>
        </button>
      </div>
    </form>
  );
};
