import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, MapPin, Users, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { EventForm } from '../../components/forms/EventForm';
import { apiFetch } from '../../services/api';
import { EventItem } from '../../types';

export const FacultyEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<{ events: EventItem[] }>('/api/events');
      setEvents(data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await apiFetch(`/api/events/${eventId}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">CCE Events Management</h2>
          <p className="text-xs text-slate-500 font-medium">Create and publish workshops, hackathons, and seminars</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading events...</div>
      ) : events.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-slate-500 text-xs">No active department events created yet.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 bg-slate-800">
                  <img
                    src={evt.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'}
                    alt={evt.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="absolute top-3 right-3 p-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-2">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">{evt.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>

                  <div className="space-y-1 pt-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#004990]" />
                      <span>{evt.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#004990]" />
                      <span>{evt.event_date} • {evt.event_time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish CCE Event"
        subtitle="Fill event details and upload banner poster"
      >
        <EventForm
          onSuccess={() => {
            setIsModalOpen(false);
            fetchEvents();
          }}
        />
      </Modal>
    </div>
  );
};
