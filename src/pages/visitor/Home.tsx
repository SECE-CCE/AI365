import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, Award, FileText, Code, ArrowRight, ShieldCheck, Maximize2, Download, Eye, Calendar, Target, Rocket } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { WindingRoadmap } from '../../components/common/WindingRoadmap';

const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 520);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 520;
    };

    window.addEventListener('resize', handleResize);

    const numParticles = Math.floor((width * height) / 16000);
    const particles = Array.from({ length: Math.max(45, numParticles) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.65,
      vy: (Math.random() - 0.5) * 0.65,
      radius: Math.random() * 2 + 1.2,
      opacity: Math.random() * 0.55 + 0.35,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Light ice-blue background matching user reference screenshot
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#f4f8ff');
      bgGrad.addColorStop(0.5, '#f0f5ff');
      bgGrad.addColorStop(1, '#eaf2ff');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and draw nodes & connecting lines
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(11, 59, 130, ${p.opacity})`;
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 145) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const lineOpacity = (1 - dist / 145) * 0.28;
            ctx.strokeStyle = `rgba(26, 86, 196, ${lineOpacity})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

export const Home: React.FC = () => {
  const [visitorStats, setVisitorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPosterModal, setShowPosterModal] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch('/api/visitor/stats');
        setVisitorStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = visitorStats?.stats || {
    learningHours: 0,
    certifications: 0,
    researchPapers: 0,
    projects: 0,
  };

  const featuredProjects: any[] = visitorStats?.featuredProjects || [];

  return (
    <div className="space-y-16 pb-12 font-['Poppins',sans-serif]">
      {/* 3D Floating Interactive Constellation Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center overflow-hidden select-none border-b border-blue-100/60 shadow-xs">
        <ParticleCanvas />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-float-3d space-y-5">
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 font-black tracking-tight text-4xl sm:text-6xl lg:text-8xl">
            <span className="text-[#1A56C4] drop-shadow-sm">AI365</span>
            <span className="inline-flex items-center justify-center w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-blue-100/90 text-[#3B82F6] text-3xl sm:text-5xl font-bold font-sans shadow-sm border border-blue-200/80 mx-1 sm:mx-2">
              @
            </span>
            <span className="text-[#D4A017] drop-shadow-sm">CCE</span>
          </div>

          <p className="text-slate-600 font-medium text-base sm:text-xl tracking-normal max-w-xl mx-auto text-center">
            Building an AI-Ready Generation
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-[#003B7A] hover:bg-[#002B5C] text-white font-bold text-sm sm:text-base rounded-full shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              <span>Join the Journey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                const element = document.getElementById('cce-poster-section');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#003B7A] font-bold text-xs sm:text-sm rounded-full shadow-sm border border-blue-200/80 transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4 text-[#D4A017]" />
              <span>View Department Poster</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Aggregated Statistics Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-[24px] border border-slate-200/80 shadow-xl p-6 lg:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#004990] flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.learningHours}+</p>
            <p className="text-xs text-slate-500 font-semibold">AI Learning Hours Logged</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <Award className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.certifications}+</p>
            <p className="text-xs text-slate-500 font-semibold">Industry Certifications</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto mb-2">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.researchPapers}+</p>
            <p className="text-xs text-slate-500 font-semibold">Research Publications</p>
          </div>

          <div className="space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-2">
              <Code className="w-5 h-5" />
            </div>
            <p className="text-3xl font-black text-slate-900">{stats.projects}+</p>
            <p className="text-xs text-slate-500 font-semibold">AI Solutions Built</p>
          </div>
        </div>
      </section>

      {/* Official Department AI365@CCE Poster Showcase Section */}
      <section id="cce-poster-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#004990] font-bold text-xs uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" /> Sri Eshwar College of Engineering — Department Vision
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            AI365 @ CCE Official Roadmap Poster
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            One Year. One Vision. One AI-Ready Campus. Department commitments for 2026–2027 including 3 AI Startups, 30 AI Solutions, 30 AI Research Articles, 300 AI Certifications & 3000 Hours of AI Learning.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#001E42] to-[#003B7A] p-4 sm:p-8 rounded-[32px] shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <div className="relative group cursor-pointer rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-slate-900 max-w-lg w-full transition-all duration-300 hover:scale-[1.02]">
              <img
                src="/cce_poster.jpeg"
                alt="Sri Eshwar College of Engineering - AI365@CCE Official Department Poster"
                className="w-full h-auto object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
              <div
                onClick={() => setShowPosterModal(true)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white font-bold text-sm"
              >
                <Maximize2 className="w-8 h-8 text-[#F3B631]" />
                <span>Click to Expand Fullscreen</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => setShowPosterModal(true)}
                className="px-4 py-2 bg-[#F3B631] hover:bg-amber-400 text-[#002B5C] rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Full Poster View</span>
              </button>
              <a
                href="/cce_poster.jpeg"
                download="cce_ai365_poster.jpeg"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-white/20 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Poster</span>
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 text-white space-y-6">
            <div>
              <span className="text-xs font-black text-[#F3B631] uppercase tracking-wider block mb-1">
                Our Commitments for 2026–2027
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                Ambitious Goals. Measurable Impact. Limitless Possibilities.
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-2xl font-black text-[#F3B631] block">3</span>
                <span className="font-bold text-white block">AI Startups</span>
                <span className="text-[11px] text-slate-300">Transform innovative ideas into AI ventures</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-2xl font-black text-emerald-400 block">30</span>
                <span className="font-bold text-white block">AI Research Articles</span>
                <span className="text-[11px] text-slate-300">Scopus-indexed conferences & journals</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-2xl font-black text-amber-300 block">30</span>
                <span className="font-bold text-white block">AI Solutions</span>
                <span className="text-[11px] text-slate-300">Industry & societal challenges</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-2xl font-black text-sky-400 block">300</span>
                <span className="font-bold text-white block">AI Certifications</span>
                <span className="text-[11px] text-slate-300">Globally recognized AI credentials</span>
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#F3B631] text-[#002B5C] font-black flex items-center justify-center text-xl shrink-0">
                3000
              </div>
              <div>
                <p className="font-bold text-white">Hours of AI Learning</p>
                <p className="text-[11px] text-slate-300">Through workshops, hackathons, certifications, research, and hands-on projects.</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300 font-semibold">
              <span>LEARN → CERTIFY → RESEARCH → BUILD → INNOVATE → IMPACT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Poster Fullscreen Modal */}
      {showPosterModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setShowPosterModal(false)}
              className="absolute -top-12 right-0 px-4 py-1.5 bg-white text-slate-900 rounded-full font-bold text-xs hover:bg-slate-200 transition-colors shadow-lg z-50"
            >
              ✕ Close Modal
            </button>
            <img
              src="/cce_poster.jpeg"
              alt="AI365@CCE Full Poster View"
              className="max-h-[85vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* 6-Step Visual Winding Road Graphic Section */}
      <WindingRoadmap />

      {/* Featured AI Projects Showcase — only shown when real approved projects exist */}
      {featuredProjects?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Featured Student AI Prototypes</h2>
            <p className="text-xs text-slate-500 font-medium mt-2">
              Innovative solutions developed by Computer & Communication Engineering students in our AI Labs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProjects.map((p: any) => (
              <div key={p.id} className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all">
                <span className="inline-block px-3 py-1 bg-blue-50 text-[#004990] font-bold text-[10px] rounded-full uppercase mb-3">
                  {p.year}
                </span>
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
