import React from 'react';
import { Users, Briefcase, Shield, Award } from 'lucide-react';

// ── Image imports ─────────────────────────────────────────────────────────────
import imgDhamodharan  from '../../../assets/Dr.S.Dhamodharan.jpg';
import imgMegala       from '../../../assets/Ms.R.Megala.jpg';
import imgPreethi      from '../../../assets/Preethi-CCE-1.jpg';
import imgSreeja       from '../../../assets/Ms.G.G.Sreeja.jpg';
import imgPrinciple    from '../../../assets/sudha-1.jpg';
import imgVivek        from '../../../assets/Dr.C.Vivek_.jpg';
import imgDarshan      from '../../../assets/DarshanAR.JPG';
import imgTanya        from '../../../assets/Tanya.jpeg';
import imgGokulnaath   from '../../../assets/Gokulnaath.jpeg';
import imgRupadharan   from '../../../assets/RupaDharan.png';

// ── Data ─────────────────────────────────────────────────────────────────────

const patron = {
  name: 'Dr. Sudha Mohanram',
  role: 'Patron',
  designation: 'Principal, Sri Eshwar College of Engineering',
  img: imgPrinciple,
};

const hod = {
  name: 'Dr. C. Vivek',
  role: 'Head of Department',
  designation: 'Professor, CCE',
  img: imgVivek,
};

const initiativeLead = {
  name: 'Dr. S. Dhamodharan',
  role: 'Initiative Lead',
  designation: 'Assistant Professor / CCE',
  img: imgDhamodharan,
};

const coordinators = [
  { name: 'Ms. G. G. Sreeja', designation: 'Assistant Professor / CCE', img: imgSreeja },
  { name: 'Ms. R. Preethi',   designation: 'Assistant Professor / CCE', img: imgPreethi },
  { name: 'Ms. R. Megala',    designation: 'Assistant Professor / CCE', img: imgMegala },
];

const students = [
  { name: 'Darshan AR',   role: 'President · 3rd Year CCE', sub: 'Developer, AI365 Platform', initials: 'DA', img: imgDarshan, featured: true },
  { name: 'Gokulnath N',  role: 'Student Coordinator',      sub: '3rd Year CCE',              initials: 'GK', img: imgGokulnaath, featured: false },
  { name: 'Tanyasri GR',  role: 'Student Coordinator',      sub: '3rd Year CCE',              initials: 'DS', img: imgTanya, featured: false },
  { name: 'Rupadharan',   role: 'Student Coordinator',      sub: '2nd Year CCE',              initials: 'RP', img: imgRupadharan, featured: false },
  { name: 'Varunkumar',   role: 'Student Coordinator',      sub: 'Student Coordinator',       initials: 'VK', img: undefined, featured: false },
];

const studentGradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-indigo-600',
  'from-cyan-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-green-600',
  'from-fuchsia-500 to-purple-700',
];

// ── Sub-components ────────────────────────────────────────────────────────────

interface LargePhotoCardProps {
  name: string;
  designation: string;
  img: string;
  badge?: string;
  badgeBg?: string;
}

const LargePhotoCard: React.FC<LargePhotoCardProps> = ({
  name,
  designation,
  img,
  badge,
  badgeBg = 'bg-blue-50 text-blue-700 border-blue-100',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-3 sm:p-4 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 w-full max-w-sm sm:max-w-md">
      <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-sm border border-slate-100 relative group-hover:shadow-md transition-shadow">
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        {badge && (
          <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${badgeBg}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 mb-2 space-y-1 px-1">
        <h4 className="text-base sm:text-lg font-extrabold text-[#002B5C] leading-snug group-hover:text-[#1A56C4] transition-colors">
          {name}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 font-semibold">
          {designation}
        </p>
      </div>
    </div>
  );
};

interface SectionHeaderProps {
  icon: React.ElementType;
  label: string;
  title: string;
  color: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, label, title, color }) => (
  <div className="text-center space-y-2 mb-10">
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${color}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </span>
    <h3 className="text-2xl sm:text-4xl font-black text-slate-900">{title}</h3>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const Team: React.FC = () => (
  <div className="min-h-screen bg-[#F8FAFC] font-['Poppins',sans-serif] pb-24">

    {/* ── Hero Banner ─────────────────────────────────────────────────────── */}
    <div className="bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#003B7A] py-16 px-4 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl" />
      <div className="relative z-10 max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F3B631]/20 border border-[#F3B631]/40 text-[#F3B631] rounded-full text-xs font-black uppercase tracking-widest">
          <Users className="w-3.5 h-3.5" /> AI365 @ CCE
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Meet the <span className="text-[#F3B631]">Team</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base font-medium max-w-xl mx-auto leading-relaxed">
          The dedicated faculty and student coordinators driving the AI365 initiative at the Department of Computer and Communication Engineering, Sri Eshwar College of Engineering.
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 mt-16">

      {/* ── Patron & HOD & Initiative Lead (Stacked Vertically) ───────── */}
      <section>
        <SectionHeader icon={Shield} label="Leadership" title="Institutional & Department Leadership" color="bg-slate-100 text-slate-700 border-slate-200" />
        <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
          {/* Patron (First) */}
          <LargePhotoCard
            name={patron.name}
            designation={patron.designation}
            img={patron.img}
            badge="Patron"
            badgeBg="bg-amber-50 text-amber-800 border-amber-200"
          />
          {/* Head of Department (Next / Below Principal) */}
          <LargePhotoCard
            name={hod.name}
            designation={hod.designation}
            img={hod.img}
            badge="Head of Department"
            badgeBg="bg-blue-50 text-blue-800 border-blue-200"
          />
          {/* Initiative Lead (Below Vivek) */}
          <LargePhotoCard
            name={initiativeLead.name}
            designation={initiativeLead.designation}
            img={initiativeLead.img}
            badge="Initiative Lead"
            badgeBg="bg-emerald-50 text-emerald-800 border-emerald-200"
          />
        </div>
      </section>

      {/* ── Faculty Coordinators (Sreeja, Preethi, Megala) ────────────────── */}
      <section>
        <SectionHeader icon={Briefcase} label="Coordinators" title="Faculty Coordinators" color="bg-violet-50 text-violet-700 border-violet-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {coordinators.map((c) => (
            <LargePhotoCard
              key={c.name}
              name={c.name}
              designation={c.designation}
              img={c.img}
              badge="Faculty Coordinator"
              badgeBg="bg-violet-800/10 text-violet-800 border-violet-200"
            />
          ))}
        </div>
      </section>

      {/* ── Student Coordinators ────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Users} label="Student Team" title="Student Coordinators" color="bg-emerald-50 text-emerald-700 border-emerald-200" />

        {/* Featured: Darshan AR */}
        <div className="max-w-[260px] sm:max-w-[280px] mx-auto mb-10">
          <div className="bg-gradient-to-br from-[#001E42] via-[#002B5C] to-[#003B7A] rounded-2xl shadow-xl p-4 flex flex-col items-center text-center border border-[#F3B631]/40 group hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#F3B631]/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Image Frame */}
            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-2 border-[#F3B631]/50 relative group-hover:border-[#F3B631] transition-all">
              <img
                src={imgDarshan}
                alt="Darshan AR"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-[#F3B631] text-[#002B5C] text-[10px] font-black uppercase tracking-wider rounded-md shadow">
                  President
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 mb-2 space-y-1 text-white">
              <h4 className="text-xl font-black tracking-tight group-hover:text-[#F3B631] transition-colors">
                Darshan AR
              </h4>
              <p className="text-xs font-bold text-[#F3B631]">
                3rd Year · CCE
              </p>
              <p className="text-xs text-slate-300 font-medium">
                Developer, AI365 Platform
              </p>
            </div>

            <div className="mt-2 pt-3 border-t border-white/10 w-full text-[11px] text-slate-300 font-semibold tracking-wide flex items-center justify-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#F3B631]" /> Built & Designed AI365 Platform
            </div>
          </div>
        </div>

        {/* Other student coordinators: Gokulnath N, Tanyasri GR, Rupadharan, Varunkumar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
          {students.filter(s => !s.featured).map((s, idx) => (
            <div key={s.name} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
              <div className={`w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${studentGradients[(idx + 1) % studentGradients.length]} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3 border border-slate-100`}>
                {s.img ? (
                  <img src={s.img} alt={s.name} className="w-full h-full object-cover object-top" />
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-white">{s.initials}</span>
                )}
              </div>
              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full mb-1 border border-emerald-100">
                Coordinator
              </span>
              <p className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                {s.name}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5">
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  </div>
);
