import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  Download,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
  FileText,
  Code,
  Rocket,
  Printer,
  Trophy,
  X
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Confetti } from '../../components/common/Confetti';
import { Modal } from '../../components/common/Modal';
import { apiFetch } from '../../services/api';
import { PassportBadge } from '../../types';

export const DigitalPassport: React.FC = () => {
  const [passportData, setPassportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [celebratingBadge, setCelebratingBadge] = useState<PassportBadge | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const fetchPassport = async () => {
    try {
      const data = await apiFetch('/api/students/passport');
      setPassportData(data);
      // Trigger confetti if student has any unlocked badges
      const unlockedCount = (data?.badges || []).filter((b: any) => b.unlocked).length;
      if (unlockedCount > 0) {
        setShowConfetti(true);
      }
    } catch (err) {
      console.error('Failed to load digital passport:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassport();
  }, []);

  const handleBadgeClick = (badge: PassportBadge) => {
    if (badge.unlocked) {
      setCelebratingBadge(badge);
      setShowConfetti(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  const student = passportData?.student || {};
  const stats = passportData?.stats || {
    learningHours: 0,
    certificates: 0,
    researchPapers: 0,
    projects: 0,
    startups: 0,
    aiScore: 0,
  };
  const targets = passportData?.targets || {
    target_learning_hours: 100,
    target_certifications: 2,
    target_research_papers: 1,
    target_projects: 2,
    target_startups: 1,
  };
  const points = passportData?.points || {
    learningHours: 0,
    certificates: 0,
    researchPapers: 0,
    projects: 0,
    total: 0,
  };
  const badges: PassportBadge[] = passportData?.badges || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 print:p-0 print:space-y-4">
      {/* Confetti Animation Layer */}
      {showConfetti && <Confetti durationMs={3500} />}

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            AI Digital Passport <ShieldCheck className="w-6 h-6 text-[#004990]" />
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Official department-verified digital credential for industry placements &amp; higher studies
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Passport PDF</span>
        </button>
      </div>

      {/* Main Official Passport Card Visual */}
      <div className="bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#004990] text-white rounded-[28px] p-6 lg:p-8 shadow-2xl border-4 border-[#F3B631]/40 relative overflow-hidden print:border-2 print:shadow-none print:bg-[#002B5C]">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 top-0 w-40 h-40 bg-[#F3B631]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header Brand */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-700/80 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F3B631] text-[#002B5C] font-black flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-300">
              365
            </div>
            <div>
              <h1 className="font-black text-xl text-white tracking-tight flex items-center gap-1.5">
                AI365 @ CCE
                <Sparkles className="w-4 h-4 text-[#F3B631]" />
              </h1>
              <p className="text-[10px] text-slate-300 uppercase tracking-widest font-semibold">
                Official Department AI Passport
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              VERIFIED CREDENTIAL
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: CCE-2026-PASSPORT-{student.id || '042'}</p>
          </div>
        </div>

        {/* Student Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex items-center space-x-4 md:col-span-2">
            <img
              src={student.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={student.full_name}
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl object-cover ring-4 ring-[#F3B631] shadow-md"
            />
            <div>
              <h3 className="text-xl lg:text-2xl font-extrabold text-white">{student.full_name}</h3>
              <p className="text-xs text-amber-300 font-bold mt-0.5">{student.register_number} • {student.year}</p>
              <p className="text-xs text-slate-300 font-medium">{student.department}</p>
              <p className="text-[11px] text-slate-400 mt-1">{student.email}</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center">
            <p className="text-[10px] text-amber-300 uppercase font-bold tracking-widest">Verified AI Score</p>
            <p className="text-4xl font-black text-white mt-1">{stats.aiScore} pts</p>
            <p className="text-[11px] text-emerald-300 mt-1 font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Department Certified
            </p>
          </div>
        </div>
      </div>

      {/* Target Progress Checklist */}
      <Card title="Year Target Competencies Progress" subtitle="Target requirements defined by CCE Department Head">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressBar
            label="1. AI Learning Hours"
            current={stats.learningHours}
            target={targets.target_learning_hours}
            unit="hrs"
            colorClass="bg-[#004990]"
          />
          <ProgressBar
            label="2. Industry Certifications"
            current={stats.certificates}
            target={targets.target_certifications}
            unit="certs"
            colorClass="bg-emerald-600"
          />
          <ProgressBar
            label="3. Research Publications"
            current={stats.researchPapers}
            target={targets.target_research_papers}
            unit="papers"
            colorClass="bg-indigo-600"
          />
          <ProgressBar
            label="4. AI Projects Built"
            current={stats.projects}
            target={targets.target_projects}
            unit="projects"
            colorClass="bg-rose-600"
          />
        </div>
      </Card>

      <Card title="Verified AI Points Breakdown" subtitle="Points are computed from verified submissions and admin-assigned marks.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold mb-3">Learning Hours Points</p>
            <p className="text-3xl font-black text-slate-900">{points.learningHours}</p>
            <p className="text-[11px] text-slate-500 mt-2">Using admin-entered marks when available</p>
          </div>
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold mb-3">Certifications Points</p>
            <p className="text-3xl font-black text-slate-900">{points.certificates}</p>
            <p className="text-[11px] text-slate-500 mt-2">Admin marks override default certification value</p>
          </div>
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold mb-3">Research Points</p>
            <p className="text-3xl font-black text-slate-900">{points.researchPapers}</p>
            <p className="text-[11px] text-slate-500 mt-2">Manual admin marks reflected here</p>
          </div>
          <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-bold mb-3">Project Points</p>
            <p className="text-3xl font-black text-slate-900">{points.projects}</p>
            <p className="text-[11px] text-slate-500 mt-2">Project points now use admin-approved values</p>
          </div>
        </div>
        <div className="mt-6 rounded-3xl bg-[#F3B631]/10 border border-[#F3B631]/20 p-4 text-center">
          <p className="text-xs text-[#004990] uppercase tracking-[0.28em] font-bold mb-2">Verified Total Points</p>
          <p className="text-4xl font-black text-[#002B5C]">{points.total} pts</p>
        </div>
      </Card>

      {/* 6 Passport Badges Progression Grid */}
      <Card title="Digital Passport Skill Badges" subtitle="6 Tiered Badges Unlocked through Verified Department Submissions (Click unlocked badges to celebrate!)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.id}
              onClick={() => handleBadgeClick(badge)}
              className={`p-5 rounded-[20px] border transition-all flex flex-col justify-between cursor-pointer ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-amber-50/90 via-white to-amber-100/40 border-amber-300 shadow-md hover:scale-105 transform duration-300 ring-2 ring-amber-300/40'
                  : 'bg-slate-50 border-slate-200/80 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                      badge.unlocked
                        ? 'bg-[#F3B631] text-[#002B5C] ring-4 ring-amber-200 animate-pulse'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {badge.unlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      badge.unlocked ? 'bg-amber-200 text-amber-900 shadow-xs' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {badge.unlocked ? 'Unlocked' : badge.level}
                  </span>
                </div>

                <h4 className="font-extrabold text-base text-slate-900">{badge.name}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">{badge.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60">
                <div className="flex justify-between items-center text-[11px] font-bold text-slate-700 mb-1">
                  <span>Requirement Status</span>
                  <span>{badge.unlocked ? '100% Complete' : `${badge.progress}%`}</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.unlocked ? 'bg-[#F3B631]' : 'bg-slate-400'
                    }`}
                    style={{ width: `${badge.unlocked ? 100 : badge.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Congratulatory Celebration Modal */}
      {celebratingBadge && (
        <Modal
          isOpen={!!celebratingBadge}
          onClose={() => setCelebratingBadge(null)}
          title={`🎉 Congratulations, ${student.full_name}!`}
          subtitle="Department Credential Achievement Unlocked"
        >
          <div className="text-center space-y-4 py-4">
            <div className="w-20 h-20 rounded-full bg-[#F3B631] text-[#002B5C] flex items-center justify-center mx-auto shadow-2xl ring-8 ring-amber-200/60 animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-xs uppercase tracking-wider">
                {celebratingBadge.level} • VERIFIED BADGE
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{celebratingBadge.name}</h3>
              <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto mt-1 leading-relaxed">
                {celebratingBadge.description}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-semibold max-w-sm mx-auto">
              ✨ You have officially achieved Level Competency in CCE AI365 platform!
            </div>

            <button
              onClick={() => setCelebratingBadge(null)}
              className="px-6 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md"
            >
              Keep Learning &amp; Elevating!
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
