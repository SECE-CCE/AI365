import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, MapPin, Clock, Users, Tag, Filter, CheckCircle, RefreshCw, AlertTriangle, Sparkles, Building, Award } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { EventForm } from '../../components/forms/EventForm';
import { apiFetch } from '../../services/api';

interface Event {
  id: number;
  created_by: number;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  event_time: string;
  max_participants: number;
  poster_url: string;
  category: string;
  created_at: string;
}

const CATEGORY_TABS = [
  'All',
  'Campus Facilities',
  'Department Events',
  'Workshops',
  'Conferences',
];

export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiFetch<{ events: Event[] }>('/api/events');
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Failed to load events:', err);
      setErrorMessage(err.message || 'Failed to fetch events from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFormSuccess = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    showNotification(editingEvent ? 'Event updated successfully!' : 'New event created successfully!');
    fetchEvents();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await apiFetch(`/api/events/${deletingId}`, {
        method: 'DELETE',
      });
      showNotification('Event deleted successfully.');
      setDeletingId(null);
      fetchEvents();
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      setErrorMessage(err.message || 'Failed to delete event.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper to match category tab with event category
  const matchesCategory = (evtCategory: string, tab: string) => {
    if (tab === 'All') return true;
    const catLower = (evtCategory || '').toLowerCase();
    const tabLower = tab.toLowerCase();
    if (catLower === tabLower) return true;
    if (tabLower === 'workshops' && catLower.includes('workshop')) return true;
    if (tabLower === 'conferences' && (catLower.includes('conference') || catLower.includes('symposium'))) return true;
    if (tabLower === 'campus facilities' && (catLower.includes('facility') || catLower.includes('facilities') || catLower.includes('lab'))) return true;
    if (tabLower === 'department events' && (catLower.includes('department') || catLower.includes('hackathon') || catLower.includes('competition'))) return true;
    return catLower.includes(tabLower);
  };

  const filteredEvents = events.filter((evt) => matchesCategory(evt.category, selectedCategory));

  // Compute stats
  const totalEventsCount = events.length;
  const campusFacilitiesCount = events.filter((e) => matchesCategory(e.category, 'Campus Facilities')).length;
  const departmentEventsCount = events.filter((e) => matchesCategory(e.category, 'Department Events')).length;
  const workshopsCount = events.filter((e) => matchesCategory(e.category, 'Workshops')).length;
  const conferencesCount = events.filter((e) => matchesCategory(e.category, 'Conferences')).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-900 text-emerald-100 border border-emerald-500/40 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#004990]/10 text-[#004990]">
              Database Persistence Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Manage Department Events
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Centralized CRUD control for campus facilities, hackathons, workshops, and research symposiums. Changes reflect instantly on the public website.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchEvents}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all font-bold flex items-center justify-center border border-slate-200"
            title="Refresh events list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#004990]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingEvent(null);
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold transition-all text-xs flex items-center gap-2 shadow-md hover:shadow-lg shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-[#004990] rounded-xl shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
            <p className="text-xl font-black text-slate-900">{totalEventsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facilities</p>
            <p className="text-xl font-black text-slate-900">{campusFacilitiesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dept Events</p>
            <p className="text-xl font-black text-slate-900">{departmentEventsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Workshops</p>
            <p className="text-xl font-black text-slate-900">{workshopsCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 sm:col-span-1 flex items-center space-x-3">
          <div className="p-3 bg-purple-50 text-purple-800 rounded-xl shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conferences</p>
            <p className="text-xl font-black text-slate-900">{conferencesCount}</p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
        <div className="px-3 text-slate-400 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider shrink-0 border-r border-slate-200 pr-4 mr-1">
          <Filter className="w-3.5 h-3.5 text-[#004990]" /> Filter:
        </div>
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab;
          const count = events.filter((e) => matchesCategory(e.category, tab)).length;
          return (
            <button
              key={tab}
              onClick={() => setSelectedCategory(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#004990] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-medium flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Events Grid */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
          <span className="text-xs font-bold tracking-wide">Loading persistent events from database...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No events found</h3>
            <p className="text-xs text-slate-500 font-medium">
              No events match the selected category tab "{selectedCategory}". Click "Create New Event" to add one.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingEvent(null);
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 bg-[#004990] text-white rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow"
          >
            <Plus className="w-4 h-4" /> Create New Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-[24px] border border-slate-200/90 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Poster Header */}
                <div className="h-56 sm:h-64 bg-slate-900 relative overflow-hidden">
                  <img
                    src={evt.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Category Pill */}
                  <span className="absolute top-4 left-4 bg-[#002B5C]/90 backdrop-blur-md text-[#F3B631] font-black text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase border border-[#F3B631]/40 shadow">
                    {evt.category || 'Event'}
                  </span>

                  {/* Edit / Delete Floating Quick Actions */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(evt)}
                      className="p-2 bg-white/90 hover:bg-white text-slate-700 hover:text-[#004990] rounded-xl backdrop-blur-md transition-all shadow-md border border-white/40"
                      title="Edit event"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(evt.id)}
                      className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl backdrop-blur-md transition-all shadow-md border border-rose-500/40"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Date Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold text-[#F3B631] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {evt.event_date || 'Date TBA'}
                    </p>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-snug">
                    {evt.title}
                  </h3>

                  {evt.description && (
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                      {evt.description}
                    </p>
                  )}

                  {/* Metadata */}
                  <div className="pt-3 flex flex-wrap gap-y-2 gap-x-4 text-xs font-semibold text-slate-500 border-t border-slate-100">
                    {evt.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#004990]" /> {evt.venue}
                      </span>
                    )}
                    {evt.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#004990]" /> {evt.event_time}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-slate-700 font-bold ml-auto">
                      <Users className="w-3.5 h-3.5 text-[#004990]" /> {evt.max_participants || 100} Seats
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="px-6 pb-6 pt-2 flex items-center gap-3 border-t border-slate-100/80 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingEvent(evt)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-[#004990]" /> Edit Details
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingId(evt.id)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Event */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Department Event"
        subtitle="Event data will be saved directly into Neon PostgreSQL and published live"
      >
        <EventForm onSuccess={handleFormSuccess} />
      </Modal>

      {/* Modal: Edit Event */}
      <Modal
        isOpen={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title={`Edit Event: ${editingEvent?.title || ''}`}
        subtitle="Update event details, poster image, schedule or capacity"
      >
        {editingEvent && (
          <EventForm
            initialData={editingEvent}
            onSuccess={handleFormSuccess}
          />
        )}
      </Modal>

      {/* Modal: Delete Confirmation */}
      <Modal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Confirm Event Deletion"
        subtitle="This action will permanently remove the event from database storage"
      >
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 space-y-1">
            <p className="font-bold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" /> Warning: Irreversible Action
            </p>
            <p className="text-xs text-rose-700">
              Are you sure you want to delete this event? All student registrations for this event will also be cleared.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setDeletingId(null)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {deleteLoading ? (
                <span>Deleting...</span>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" /> <span>Delete Event</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
