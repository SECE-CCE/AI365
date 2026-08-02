import React, { useState, useEffect } from 'react';
import { Camera, Calendar, MapPin, Clock, Users, ArrowRight, Sparkles, X, CheckCircle2, ExternalLink } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { Link } from 'react-router-dom';

interface GalleryItem {
  id: string | number;
  title: string;
  category: string;
  poster_url: string;
  venue?: string;
  event_date?: string;
  event_time?: string;
  max_participants?: number;
  description?: string;
  highlights?: string[];
  isCustomAdmin?: boolean;
}

const defaultGalleryItems: GalleryItem[] = [
  {
    id: 'default-1',
    title: 'CCE Innovation & AI Hardware Lab',
    category: 'Campus Facilities',
    venue: 'CCE Hardware Lab, 2nd Floor, Main Block',
    event_date: 'Every Weekday',
    event_time: '09:00 AM - 05:00 PM',
    max_participants: 60,
    poster_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    description: 'State-of-the-art laboratory equipped with high-performance GPU workstations, NVIDIA Jetson Orin Nano development kits, edge TPU accelerators, and embedded AI development hardware for student research and innovation projects.',
    highlights: ['NVIDIA Jetson Orin Kits', 'High-end RTX GPU Workstations', 'Edge AI & Embedded Systems Lab'],
  },
  {
    id: 'default-2',
    title: 'National AI & Robotics Hackathon 2026',
    category: 'Department Events',
    venue: 'Sri Eshwar Central Auditorium & CCE Computing Labs',
    event_date: 'August 15-16, 2026',
    event_time: '36-Hour Continuous Build',
    max_participants: 250,
    poster_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    description: 'A national-level 36-hour hackathon bringing together top engineering talent to solve real-world industry challenges using Generative AI, Computer Vision, Autonomous Robotics, and Agentic Workflows.',
    highlights: ['₹1,50,000 Cash Prize Pool', 'Industry Mentors from Top Tech Companies', 'Direct Incubation Opportunities'],
  },
  {
    id: 'default-3',
    title: 'NVIDIA Deep Learning Institute Hands-On Workshop',
    category: 'Workshops',
    venue: 'CCE AI Research Lab',
    event_date: 'September 5, 2026',
    event_time: '10:00 AM - 04:30 PM',
    max_participants: 80,
    poster_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    description: 'Certified hands-on workshop on Fundamentals of Deep Learning, Transformer Architecture, and Model Optimization using PyTorch and CUDA.',
    highlights: ['Official NVIDIA DLI Certificate', 'Hands-on Cloud GPU Workstations', 'Transformer & LLM Fine-tuning'],
  },
  {
    id: 'default-4',
    title: 'IEEE Research Paper Presentation & AI Symposium',
    category: 'Conferences',
    venue: 'Seminar Hall 2',
    event_date: 'October 12, 2026',
    event_time: '09:30 AM - 04:00 PM',
    max_participants: 120,
    poster_url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    description: 'Departmental symposium featuring peer-reviewed student research presentations, keynotes by distinguished scientists, and poster exhibition of domain-specific AI projects.',
    highlights: ['IEEE Scopus-Indexed Publication Tracks', 'Best Paper Awards', 'Peer Review Feedback from Professors'],
  },
];

export const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(defaultGalleryItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEvents = async () => {
    try {
      const data = await apiFetch<{ events: any[] }>('/api/events');
      if (data && data.events && data.events.length > 0) {
        const fetchedItems: GalleryItem[] = data.events.map((evt: any) => ({
          id: evt.id,
          title: evt.title,
          category: evt.category || 'Department Events',
          poster_url: evt.poster_url || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
          venue: evt.venue || 'CCE Department',
          event_date: evt.event_date || 'Upcoming',
          event_time: evt.event_time || 'TBA',
          max_participants: evt.max_participants || 100,
          description: evt.description || 'Department event organized by CCE faculty and student coordinators.',
          highlights: ['Official CCE Event', 'Certificate of Participation Provided', 'Open to CCE Students'],
          isCustomAdmin: true,
        }));
        // Merge admin events at top, then default items
        setItems([...fetchedItems, ...defaultGalleryItems]);
      } else {
        setItems(defaultGalleryItems);
      }
    } catch (err) {
      console.error('Failed to load dynamic gallery events:', err);
      setItems(defaultGalleryItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Poppins',sans-serif] pb-24">
      {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#003B7A] py-12 sm:py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F3B631]/20 border border-[#F3B631]/40 text-[#F3B631] rounded-full text-xs font-black uppercase tracking-widest">
            <Camera className="w-3.5 h-3.5" /> Life at CCE
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            CCE Department <span className="text-[#F3B631]">Gallery & Events</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm lg:text-base font-medium max-w-xl mx-auto leading-relaxed">
            Glimpses of hackathons, AI research seminars, laboratory sessions, and student innovation showcases. Click any poster to view complete event details.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-[#002B5C] text-[#F3B631] shadow-md scale-105 border border-[#F3B631]/30'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="bg-white rounded-[24px] border border-slate-200/80 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="h-56 sm:h-64 lg:h-72 bg-slate-900 overflow-hidden relative">
                  <img
                    src={item.poster_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  
                  <span className="absolute top-4 left-4 bg-[#002B5C]/90 backdrop-blur-md text-[#F3B631] font-black text-[10px] sm:text-xs px-3.5 py-1.5 rounded-full uppercase border border-[#F3B631]/40 shadow-sm">
                    {item.category}
                  </span>

                  {item.isCustomAdmin && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white font-black text-[10px] px-3 py-1 rounded-full uppercase shadow">
                      New Event
                    </span>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs font-bold text-[#F3B631] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {item.event_date || 'Upcoming Event'}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 space-y-3">
                  <h3 className="font-black text-slate-900 text-lg sm:text-xl leading-snug group-hover:text-[#1A56C4] transition-colors">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap gap-y-1 gap-x-4 text-xs font-semibold text-slate-500 border-t border-slate-100">
                    {item.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#004990]" /> {item.venue}
                      </span>
                    )}
                    {item.event_time && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#004990]" /> {item.event_time}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveItem(item);
                  }}
                  className="w-full py-2.5 px-4 bg-slate-50 hover:bg-[#002B5C] text-[#002B5C] hover:text-white rounded-xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 border border-slate-200/80 group-hover:border-[#002B5C]"
                >
                  <span>View Event Poster &amp; Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Event Detail Modal Popup ────────────────────────────────────────── */}
      {activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setActiveItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full sm:max-w-3xl rounded-t-[28px] sm:rounded-[28px] max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Poster Header */}
            <div className="relative h-64 sm:h-80 bg-slate-900 shrink-0">
              <img
                src={activeItem.poster_url}
                alt={activeItem.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              <button
                onClick={() => setActiveItem(null)}
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black text-white rounded-full backdrop-blur-md transition-colors border border-white/20 shadow-lg"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6 text-white space-y-2">
                <span className="inline-block px-3 py-1 bg-[#F3B631] text-[#002B5C] font-black text-[10px] sm:text-xs rounded-full uppercase tracking-wider shadow">
                  {activeItem.category}
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-white leading-tight">
                  {activeItem.title}
                </h2>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 overflow-y-auto space-y-6 custom-scrollbar flex-1">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-100 text-[#004990] rounded-xl shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date &amp; Time</p>
                    <p className="text-xs font-black text-slate-800">{activeItem.event_date}</p>
                    {activeItem.event_time && (
                      <p className="text-[11px] font-semibold text-slate-500">{activeItem.event_time}</p>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Venue</p>
                    <p className="text-xs font-black text-slate-800 line-clamp-1">{activeItem.venue || 'CCE Campus'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                    <p className="text-xs font-black text-slate-800">{activeItem.max_participants || 100} Seats Available</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {activeItem.description && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">About this Event</h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-slate-200/80">
                    {activeItem.description}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {activeItem.highlights && activeItem.highlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Event Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeItem.highlights.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-semibold text-center sm:text-left">
                  Organized by Department of Computer &amp; Communication Engineering
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveItem(null)}
                    className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Close
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setActiveItem(null)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-[#002B5C] hover:bg-[#004990] text-[#F3B631] rounded-xl font-black text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Login to Register</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
