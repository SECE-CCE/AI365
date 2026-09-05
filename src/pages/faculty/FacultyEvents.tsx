import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, Edit2, MapPin, Users, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { EventForm } from '../../components/forms/EventForm';
import { apiFetch } from '../../services/api';
import { EventItem } from '../../types';

export const FacultyEvents: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

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

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: EventItem) => {
    setEditingEvent(evt);
    setIsModalOpen(true);
  };

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
    <div className="space-y-6 animate-in fade-in duration-300 font-['Poppins',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            CCE Events Management <Calendar className="w-6 h-6 text-[#004990]" />
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Create, edit, and publish workshops, hackathons, and seminars visible on the main page.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#F3B631]" />
          <span>Create New Event</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading events...</div>
      ) : events.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            No active department events created yet. Click "Create New Event" above to publish your first CCE event.
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={evt.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-[#F3B631] font-bold text-[10px] uppercase tracking-wider rounded-full border border-white/20">
                    {evt.category || 'Workshop'}
                  </span>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(evt)}
                      className="p-2 bg-white/90 hover:bg-white text-[#004990] rounded-xl shadow-md transition-colors"
                      title="Edit Event Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="p-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl shadow-md transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[10px] font-extrabold text-blue-200 uppercase tracking-widest block mb-0.5">
                      {evt.event_date} · {evt.event_time}
                    </span>
                    <h3 className="font-black text-white text-base leading-tight line-clamp-1">{evt.title}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{evt.description || 'No description provided.'}</p>

                  <div className="space-y-1.5 pt-2 text-xs font-semibold text-slate-700 border-t border-slate-100">
                    <div className="flex items-center space-x-2 text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-[#004990] shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Max Capacity: <strong className="text-slate-800">{evt.max_participants || 100} Seats</strong></span>
                      </div>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        title={editingEvent ? `Edit Event: ${editingEvent.title}` : 'Publish CCE Event'}
        subtitle={editingEvent ? 'Modify event details and banner poster' : 'Fill event details and upload banner poster'}
      >
        <EventForm
          initialData={editingEvent}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
            fetchEvents();
          }}
        />
      </Modal>
    </div>
  );
};
