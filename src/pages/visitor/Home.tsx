import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, Award, FileText, Code, ArrowRight, Maximize2, Download, Eye, Target,
  Rocket, FlaskConical, Zap, Lightbulb, FileCheck, Leaf, BookOpen, Hammer,
  MonitorPlay, GraduationCap, Trophy, ChevronRight, MapPin, Users, Sparkles, Calendar,
} from 'lucide-react';
import { apiFetch } from '../../services/api';

/* ─── Particle Canvas ───────────────────────────────────────────────────── */
const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    let width = (canvas.width = Math.max(canvas.parentElement?.clientWidth || window.innerWidth || 800, 100));
    let height = (canvas.height = Math.max(canvas.parentElement?.clientHeight || 520, 100));
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = Math.max(canvas.parentElement?.clientWidth || window.innerWidth || 800, 100);
      height = canvas.height = Math.max(canvas.parentElement?.clientHeight || 520, 100);
    };
    window.addEventListener('resize', handleResize);
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6, vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1.2, opacity: Math.random() * 0.5 + 0.35,
    }));
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, '#f4f8ff'); bg.addColorStop(0.5, '#f0f5ff'); bg.addColorStop(1, '#eaf2ff');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = width; if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; if (p.y > height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11,59,130,${p.opacity})`; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
          if (d < 145) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(26,86,196,${(1 - d / 145) * 0.25})`; ctx.lineWidth = 0.9; ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationFrameId); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ─── Phase Data ────────────────────────────────────────────────────────── */
const phases = [
  { phase: 'Phase 1',  month: "July '26",  title: 'AI Kickstart',                    desc: 'Orientation, team formation & AI fundamentals bootcamp',              icon: Rocket,        color: 'from-violet-500 to-purple-600',  badge: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  { phase: 'Phase 2',  month: "Aug '26",   title: 'Certify AI Marathon',              desc: 'Industry certification drives — NPTEL, Google, AWS & more',           icon: Award,         color: 'from-blue-500 to-indigo-600',    badge: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  { phase: 'Phase 3',  month: "Sep '26",   title: 'AI ResearchX',                    desc: 'Research paper writing workshops & IEEE/Springer submissions',         icon: FlaskConical,  color: 'from-cyan-500 to-teal-600',      badge: 'bg-cyan-100 text-cyan-700',      dot: 'bg-cyan-500' },
  { phase: 'Phase 4',  month: "Oct '26",   title: 'AgentX Hackfest',                 desc: '48-hour hackathon — build AI agents & autonomous systems',            icon: Zap,           color: 'from-amber-500 to-orange-600',   badge: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  { phase: 'Phase 5',  month: "Nov '26",   title: 'Faculty AI Innovate',              desc: 'Faculty-led AI solution sprints & mentorship sessions',               icon: Lightbulb,     color: 'from-yellow-400 to-amber-500',   badge: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-500' },
  { phase: 'Phase 6',  month: "Dec '26",   title: 'PatentX AI',                      desc: 'Patent drafting camp — file AI inventions & innovations',             icon: FileCheck,     color: 'from-rose-500 to-pink-600',      badge: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-500' },
  { phase: 'Phase 7',  month: "Jan '27",   title: 'Sustain AI',                      desc: 'AI for sustainability — green tech projects & deployment',            icon: Leaf,          color: 'from-emerald-500 to-green-600',  badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  { phase: 'Phase 8',  month: "Feb '27",   title: 'Certify AI Marathon II',           desc: 'Second round of certification drives & skill-gap workshops',          icon: BookOpen,      color: 'from-sky-500 to-blue-600',       badge: 'bg-sky-100 text-sky-700',        dot: 'bg-sky-500' },
  { phase: 'Phase 9',  month: "Mar '27",   title: 'Build AI',                        desc: 'End-to-end product build sprint — from idea to prototype',           icon: Hammer,        color: 'from-orange-500 to-red-600',     badge: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
  { phase: 'Phase 10', month: "Apr '27",   title: 'BuildFest AI — AI Project Expo',  desc: 'Public expo: live demos, investor pitches & startup launches',        icon: MonitorPlay,   color: 'from-fuchsia-500 to-purple-700', badge: 'bg-fuchsia-100 text-fuchsia-700',dot: 'bg-fuchsia-500' },
  { phase: 'Phase 11', month: "May '27",   title: 'AI Summer School 2027',           desc: 'Intensive summer programme for advanced AI & research tracks',        icon: GraduationCap, color: 'from-teal-500 to-cyan-600',      badge: 'bg-teal-100 text-teal-700',      dot: 'bg-teal-500' },
  { phase: 'Phase 12', month: "June '27",  title: 'AI365 Conclave & Awards 2027',    desc: 'Annual grand conclave — awards, keynotes & year-end showcase',       icon: Trophy,        color: 'from-gold-500 to-amber-600',     badge: 'bg-amber-100 text-amber-800',    dot: 'bg-amber-600' },
];

/* ─── Home Page ─────────────────────────────────────────────────────────── */
export const Home: React.FC = () => {
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    const fetchStats = () => {
      apiFetch('/api/visitor/stats').then(setVisitorStats).catch(console.error);
      apiFetch('/api/events').then((res: any) => setEvents(res.events || [])).catch(console.error);
    };
    fetchStats();
    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchStats(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const stats = visitorStats?.stats || { learningHours: 0, certifications: 0, researchPapers: 0, projects: 0 };
  const featuredProjects: any[] = visitorStats?.featuredProjects || [];

  return (
    <div className="space-y-20 pb-12 font-['Poppins',sans-serif]">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[420px] sm:h-[520px] flex items-center justify-center overflow-hidden border-b border-blue-100/60">
        <ParticleCanvas />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/60 shadow-sm text-[11px] font-bold text-[#004990] uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sri Eshwar College of Engineering · CCE Department
          </div>
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 font-black tracking-tight text-5xl sm:text-7xl lg:text-8xl select-none">
            <span className="bg-gradient-to-r from-purple-700 via-fuchsia-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">AI</span>
            <span className="text-[#001E42] drop-shadow-sm">365</span>
            <span className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full border-2 sm:border-4 border-[#001E42] text-[#001E42] font-bold font-sans text-3xl sm:text-4xl lg:text-5xl shadow-sm">@</span>
            <span className="text-[#001E42] drop-shadow-sm">CCE</span>
          </div>
          <p className="text-slate-600 font-semibold text-base sm:text-lg max-w-xl mx-auto">Building an AI-Ready Generation — One Year · One Vision · One Campus</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="px-8 py-3.5 bg-[#003B7A] hover:bg-[#002B5C] text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 inline-flex items-center gap-2 hover:-translate-y-0.5 transform">
              <span>Join the Journey</span><ArrowRight className="w-4 h-4" />
            </Link>
            <button onClick={() => document.getElementById('cce-poster-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#003B7A] font-bold text-sm rounded-full shadow-sm border border-blue-200/80 transition-all flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D4A017]" />View Poster
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        <div className="bg-white rounded-[28px] border border-slate-200/80 shadow-2xl p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            { icon: Clock,    bg: 'bg-blue-50',    text: 'text-blue-600',    value: stats.learningHours,  label: 'AI Learning Hours' },
            { icon: Award,    bg: 'bg-emerald-50', text: 'text-emerald-600', value: stats.certifications, label: 'Certifications' },
            { icon: FileText, bg: 'bg-indigo-50',  text: 'text-indigo-600',  value: stats.researchPapers, label: 'Research Papers' },
            { icon: Code,     bg: 'bg-rose-50',    text: 'text-rose-600',    value: stats.projects,       label: 'AI Solutions Built' },
          ].map(({ icon: Icon, bg, text, value, label }) => (
            <div key={label} className="space-y-1 group">
              <div className={`w-11 h-11 rounded-2xl ${bg} ${text} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">{value}+</p>
              <p className="text-xs text-slate-500 font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PHASE ROADMAP ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-blue-100 text-[#4F46E5] font-bold text-xs uppercase tracking-widest border border-violet-200/60">
            <Target className="w-3.5 h-3.5" /> 12-Month AI Event Calendar
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            The AI365 Journey
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            From <strong className="text-slate-700">AI Kickstart</strong> to <strong className="text-slate-700">AI365 Conclave</strong> — 12 powerful phases crafted to build AI-ready engineers at CCE.
          </p>
        </div>

        {/* Phase grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {phases.map((p, idx) => {
            const IconComp = p.icon;
            return (
              <div
                key={idx}
                className="group relative bg-white rounded-[24px] border border-slate-200/70 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${p.color}`} />

                <div className="p-5 space-y-4">
                  {/* Phase label + month */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${p.badge}`}>
                      {p.phase}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                      {p.month}
                    </span>
                  </div>

                  {/* Icon + Title */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{p.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>

                  {/* Bottom connector */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className={`w-2 h-2 rounded-full ${p.dot}`} />
                    <span className="text-[10px] text-slate-400 font-semibold">CCE · AI365 Programme</span>
                    <ChevronRight className="w-3 h-3 text-slate-300 ml-auto" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline strip at the bottom */}
        <div className="relative mt-6 overflow-x-auto pb-2">
          <div className="flex items-center gap-0 min-w-max mx-auto">
            {phases.map((p, idx) => (
              <div key={idx} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${p.dot} shadow ring-2 ring-white`} />
                  <span className="text-[9px] font-bold text-slate-500 whitespace-nowrap">{p.month}</span>
                </div>
                {idx < phases.length - 1 && (
                  <div className="w-16 h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUBLISHED CCE EVENTS & WORKSHOPS ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-[#004990] font-bold text-xs uppercase tracking-widest border border-amber-200/80">
            <Sparkles className="w-3.5 h-3.5 text-[#F3B631]" /> Department Events &amp; Sprints
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Upcoming CCE Events &amp; Workshops
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Live workshops, hackathons, seminars, and symposiums published by the CCE Department.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 text-center text-slate-500 text-xs font-medium shadow-sm">
            No live department events currently published. Check back soon for upcoming hackathons &amp; workshops!
          </div>
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

                <div className="p-5 pt-0">
                  <Link
                    to="/login"
                    className="w-full py-2.5 bg-blue-50 hover:bg-[#004990] text-[#004990] hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-blue-100"
                  >
                    <span>Sign In to Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── POSTER SECTION ───────────────────────────────────────────────── */}
      <section id="cce-poster-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 text-[#004990] font-bold text-xs uppercase tracking-widest border border-blue-100">
            <Target className="w-3.5 h-3.5" /> Sri Eshwar College of Engineering · Department Vision
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">AI365 @ CCE Official Roadmap Poster</h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            One Year. One Vision. One AI-Ready Campus. Department commitments for 2026–2027 including 3 AI Startups, 30 AI Solutions, 30 AI Research Articles, 300 AI Certifications &amp; 3000 Hours of AI Learning.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#003B7A] p-5 sm:p-10 rounded-[32px] shadow-2xl border border-slate-700/40 relative overflow-hidden flex flex-col lg:flex-row items-center gap-10">
          {/* Decorative blur orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Poster image */}
          <div className="w-full lg:w-1/2 flex flex-col items-center relative z-10">
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-slate-900 max-w-lg w-full hover:scale-[1.02] transition-all duration-300">
              <img src="/cce_poster.jpeg" alt="AI365@CCE Official Department Poster"
                className="w-full h-auto object-cover rounded-xl" referrerPolicy="no-referrer" />
              <div onClick={() => setShowPosterModal(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-sm">
                <Maximize2 className="w-8 h-8 text-[#F3B631]" />
                <span>Click to Expand</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button onClick={() => setShowPosterModal(true)}
                className="px-4 py-2 bg-[#F3B631] hover:bg-amber-400 text-[#002B5C] rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all">
                <Maximize2 className="w-4 h-4" />Full Poster View
              </button>
              <a href="/cce_poster.jpeg" download="cce_ai365_poster.jpeg"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-white/20 transition-all">
                <Download className="w-4 h-4" />Download
              </a>
            </div>
          </div>

          {/* Goals */}
          <div className="w-full lg:w-1/2 text-white space-y-6 relative z-10">
            <div>
              <span className="text-xs font-black text-[#F3B631] uppercase tracking-wider block mb-1">Our Commitments for 2026–2027</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">Ambitious Goals. Measurable Impact. Limitless Possibilities.</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              {[
                { val: '3',    label: 'AI Startups',          sub: 'Transform innovative ideas into ventures', color: 'text-[#F3B631]' },
                { val: '30',   label: 'AI Research Articles', sub: 'Scopus-indexed conferences & journals',     color: 'text-emerald-400' },
                { val: '30',   label: 'AI Solutions',         sub: 'Industry & societal challenges solved',     color: 'text-amber-300' },
                { val: '300',  label: 'AI Certifications',    sub: 'Globally recognized AI credentials',        color: 'text-sky-400' },
              ].map(({ val, label, sub, color }) => (
                <div key={label} className="bg-white/10 hover:bg-white/15 transition-colors p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className={`text-2xl font-black ${color} block`}>{val}</span>
                  <span className="font-bold text-white block">{label}</span>
                  <span className="text-[11px] text-slate-300">{sub}</span>
                </div>
              ))}
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#F3B631] text-[#002B5C] font-black flex items-center justify-center text-base shrink-0 leading-tight text-center">
                3000<br /><span className="text-[8px]">HRS</span>
              </div>
              <div>
                <p className="font-bold text-white">Hours of AI Learning</p>
                <p className="text-[11px] text-slate-300">Through workshops, hackathons, certifications, research, and hands-on projects.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400 font-semibold tracking-wide">
              LEARN → CERTIFY → RESEARCH → BUILD → INNOVATE → IMPACT
            </div>
          </div>
        </div>
      </section>

      {/* ── POSTER MODAL ─────────────────────────────────────────────────── */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button onClick={() => setShowPosterModal(false)}
              className="absolute -top-12 right-0 px-4 py-1.5 bg-white text-slate-900 rounded-full font-bold text-xs hover:bg-slate-200 transition-colors shadow-lg z-50">
              ✕ Close
            </button>
            <img src="/cce_poster.jpeg" alt="AI365@CCE Full Poster"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20" />
          </div>
        </div>
      )}

      {/* ── FEATURED PROJECTS ────────────────────────────────────────────── */}
      {featuredProjects?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured Student AI Prototypes</h2>
            <p className="text-xs text-slate-500 font-medium mt-2">Innovative solutions developed by Computer &amp; Communication Engineering students.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((p: any) => (
              <div key={p.id} className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
                <span className="inline-block px-3 py-1 bg-blue-50 text-[#004990] font-bold text-[10px] rounded-full uppercase mb-3">{p.year}</span>
                <h3 className="text-lg font-extrabold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-xs text-slate-600 mb-4">{p.ai_contribution}</p>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>By {p.student_name}</span>
                  <span className="text-[#004990]">{p.tech_stack}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

