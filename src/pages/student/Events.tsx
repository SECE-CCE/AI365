import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Users, CheckCircle, Sparkles, ExternalLink, FileSpreadsheet, X, Eye, ArrowRight } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { apiFetch } from '../../services/api';
import { EventItem } from '../../types';

export const Events: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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

  const handleRegister = async (evt: any) => {
    try {
      // If external sheet/form link exists -> Open Google Sheet / Excel immediately!
      if (evt.registration_link && evt.registration_link.trim()) {
        const raw = evt.registration_link.trim();
        const targetUrl = raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`;

        // Also track user registration in the database in the background if not registered
        if (!evt.isUserRegistered) {
          apiFetch(`/api/events/${evt.id}/register`, { method: 'POST' }).catch(console.error);
        }

        window.location.href = targetUrl;
        return;
      }

      if (evt.isUserRegistered) {
        await apiFetch(`/api/events/${evt.id}/register`, { method: 'DELETE' });
      } else {
        await apiFetch(`/api/events/${evt.id}/register`, { method: 'POST' });
      }
      fetchEvents();
      if (selectedEvent && selectedEvent.id === evt.id) {
        setSelectedEvent({ ...selectedEvent, isUserRegistered: !evt.isUserRegistered });
      }
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
          CCE Workshops &amp; Hackathons <Calendar className="w-6 h-6 text-[#F3B631]" />
        </h2>
        <p className="text-xs text-slate-200 mt-1 max-w-2xl">
          Participate in national hackathons, NVIDIA AI workshops, research seminars, and hands-on coding bootcamps organized by CCE faculty. Click any card to view full event agenda and details.
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
              onClick={() => setSelectedEvent(evt)}
              className="bg-white rounded-[24px] border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className="relative h-44 bg-slate-800 overflow-hidden">
                  <img
                    src={evt.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600'}
                    alt={evt.title}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
                  <div className="absolute top-3 left-3">
                    <Badge label={evt.category || 'Workshop'} variant="amber" />
                  </div>
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow">
                    <Eye className="w-3 h-3 text-[#F3B631]" /> View Details
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-[#004990] transition-colors">
                    {evt.title}
                  </h3>

                  {evt.description && (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                      <span className="text-[11px] font-bold text-[#004990] group-hover:underline inline-flex items-center gap-1">
                        Read full details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  )}

                  {evt.registration_link && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200">
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>External Form / Sheet Attached</span>
                        <ExternalLink className="w-3 h-3 text-emerald-600 shrink-0" />
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 pt-2 text-xs font-semibold text-slate-700 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#004990] shrink-0" />
                      <span className="truncate">{evt.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#004990] shrink-0" />
                      <span>{evt.event_date} • {evt.event_time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-[#004990] shrink-0" />
                      <span>
                        {evt.participantCount || 0} / {evt.max_participants || 100} Seats Registered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRegister(evt);
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                    evt.isUserRegistered && !evt.registration_link
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#004990] hover:bg-[#002B5C] text-white shadow-md'
                  }`}
                >
                  {evt.registration_link ? (
                    <>
                      <FileSpreadsheet className="w-4 h-4 text-[#F3B631]" />
                      <span>Register Spot (Excel / Form)</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  ) : evt.isUserRegistered ? (
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

      {/* ── Relatively Larger Event Details Modal Popup ── */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-3xl lg:max-w-4xl rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Poster Header */}
            <div className="relative h-64 sm:h-80 lg:h-96 bg-slate-900 shrink-0 overflow-hidden">
              <img
                src={selectedEvent.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md transition-colors border border-white/20 shadow-lg cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white space-y-2">
                <span className="inline-block px-3 py-1 bg-[#F3B631] text-[#002B5C] font-black text-[10px] sm:text-xs rounded-full uppercase tracking-wider shadow">
                  {selectedEvent.category || 'Department Event'}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal Body with Complete Information */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-100 text-[#004990] rounded-xl shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date &amp; Time</p>
                    <p className="text-xs font-black text-slate-800">{selectedEvent.event_date}</p>
                    {selectedEvent.event_time && (
                      <p className="text-[11px] font-semibold text-slate-500">{selectedEvent.event_time}</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue</p>
                    <p className="text-xs font-black text-slate-800">{selectedEvent.venue || 'CCE Campus'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                    <p className="text-xs font-black text-slate-800">
                      {selectedEvent.participantCount || 0} / {selectedEvent.max_participants || 100} Seats
                    </p>
                  </div>
                </div>
              </div>

              {/* External Registration Link Notice if provided */}
              {selectedEvent.registration_link && (
                <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">External Registration Link Attached</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Registration for this event is managed via an official external Google Sheet, Excel workbook, or Form. Clicking the button below will immediately open the registration sheet.
                    </p>
                  </div>
                </div>
              )}

              {/* Complete Event Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Event Description &amp; Complete Details
                </h4>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                  {selectedEvent.description || 'No detailed agenda provided for this event.'}
                </div>
              </div>

              {/* Department Highlights */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Department Note</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Official CCE Department Activity</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Eligible for AI Learning Hours &amp; Portfolio Credits</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 sm:px-8 sm:py-5 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-semibold text-center sm:text-left">
                Department of Computer &amp; Communication Engineering
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleRegister(selectedEvent)}
                  className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                    selectedEvent.isUserRegistered && !selectedEvent.registration_link
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-[#004990] hover:bg-[#002B5C] text-white'
                  }`}
                >
                  {selectedEvent.registration_link ? (
                    <>
                      <FileSpreadsheet className="w-4 h-4 text-[#F3B631]" />
                      <span>Register Spot (Excel / Form)</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                    </>
                  ) : selectedEvent.isUserRegistered ? (
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
          </div>
        </div>
      )}
    </div>
  );
};
