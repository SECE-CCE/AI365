import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, Sparkles } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { apiFetch } from '../../services/api';
import { EventItem } from '../../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<{ events: any[] }>('/api/events');
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load CCE events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: number, currentRegistered: boolean) => {
    try {
      if (currentRegistered) {
        await apiFetch(`/api/events/${eventId}/register`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/events/${eventId}/register`, { method: 'POST' });
      }
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B5C] via-[#004990] to-slate-900 text-white rounded-[24px] p-6 lg:p-8 shadow-md">
        <span className="inline-block px-3 py-1 rounded-full bg-[#F3B631] text-[#002B5C] text-[11px] font-extrabold uppercase tracking-wider mb-2">
          Department Activities
        </span>
        <h2 className="text-2xl lg:text-3xl font-black tracking-tight flex items-center gap-2">
          CCE Workshops & Hackathons <Calendar className="w-6 h-6 text-[#F3B631]" />
        </h2>
        <p className="text-xs text-slate-200 mt-1 max-w-2xl">
          Participate in national hackathons, NVIDIA AI workshops, research seminars, and hands-on coding bootcamps organized by CCE faculty.
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">Loading events...</div>
      ) : events.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-slate-500 text-xs">No active CCE events scheduled right now.</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-800 overflow-hidden">
                  <img
                    src={evt.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'}
                    alt={evt.title}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge label={evt.category || 'Workshop'} variant="amber" />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{evt.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{evt.description}</p>

                  <div className="space-y-1.5 pt-2 text-xs font-semibold text-slate-700">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#004990]" />
                      <span>{evt.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#004990]" />
                      <span>{evt.event_date} • {evt.event_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-[#004990]" />
                      <span>
                        {evt.participantCount} / {evt.max_participants} Seats Registered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => handleRegister(evt.id, evt.isUserRegistered)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 ${
                    evt.isUserRegistered
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#004990] hover:bg-[#002B5C] text-white shadow-md'
                  }`}
                >
                  {evt.isUserRegistered ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Registered (Click to Leave)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#F3B631]" />
                      <span>Register Spot</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
