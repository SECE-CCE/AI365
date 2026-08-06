import React from 'react';
import { Users, Briefcase, Shield, Award, GraduationCap } from 'lucide-react';

// ── Image imports ─────────────────────────────────────────────────────────────
import imgDhamodharan from '../../../assets/Dr.S.Dhamodharan.jpg';
import imgMegala from '../../../assets/Ms.R.Megala.jpg';
import imgPreethi from '../../../assets/Preethi-CCE-1.jpg';
import imgSreeja from '../../../assets/Ms.G.G.Sreeja.jpg';
import imgPrinciple from '../../../assets/sudha-1.jpg';
import imgVivek from '../../../assets/Dr.C.Vivek_.jpg';
import imgDarshan from '../../../assets/DarshanAR.JPG';
import imgTanya from '../../../assets/Tanya.jpeg';
import imgGokulnaath from '../../../assets/Gokulnaath.jpeg';
import imgRupadharan from '../../../assets/RupaDharan.png';
import imgVarunkumar from '../../../assets/VarunKumar.jpeg';
import imgNitin from '../../../assets/Nitin.jpeg';
import imgHariNikesh from '../../../assets/Hari_Nikesh_R.jpg';
import imgNaveenPrasaath from '../../../assets/Naveen_alumini.png';


import imgGanesh from '../../../assets/Dr.C.Ganesh.jpg';
import imgBabitha from '../../../assets/Dr.R.Babitha-Lincy.jpg';
import imgThirrunavukkarasu from '../../../assets/Thirunavukarasu.jpg';
import imgArun from '../../../assets/Mr.R.Arun_.jpg';
import imgDency from '../../../assets/Ms.-Dency-Flora-G.jpg';
import imgBanupriya from '../../../assets/Ms.N.Banupriya.jpg';

import imgTiket from '../../../assets/tiket_com.svg';
import imgAvasoft from '../../../assets/avasoft.svg';

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
  designation: 'Associate Professor / CCE',
  img: imgDhamodharan,
};

const coordinators = [
  { name: 'Ms. G. G. Sreeja', designation: 'Assistant Professor / CCE', img: imgSreeja },
  { name: 'Ms. R. Preethi', designation: 'Assistant Professor / CCE', img: imgPreethi },
  { name: 'Ms. R. Megala', designation: 'Assistant Professor / CCE', img: imgMegala },
];

const facultyMentors = [
  { name: 'Ms. N. Banupriya', designation: 'Assistant Professor', img: imgBanupriya },
  { name: 'Dr. C. Ganesh', designation: 'Associate Professor', img: imgGanesh },
  { name: 'Dr. R. Babitha Lincy', designation: 'Assistant Professor', img: imgBabitha },
  { name: 'Dr. R. R. Thirrunavukkarasu', designation: 'Assistant Professor', img: imgThirrunavukkarasu },
  { name: 'Mr. R. Arun', designation: 'Assistant Professor', img: imgArun },
  { name: 'Ms. Dency Flora G', designation: 'Assistant Professor', img: imgDency },
];

const alumniMentors = [
  {
    name: 'Hari Nikesh R',
    company: 'tiket.com',
    logo: imgTiket,
    initials: 'HN',
    img: imgHariNikesh,
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    name: 'Naveen Prasaath S',
    company: 'AVASOFT',
    logo: imgAvasoft,
    initials: 'NP',
    img: imgNaveenPrasaath,
    gradient: 'from-orange-500 to-amber-600',
  },
];

const developers = [
  { name: 'Tanyasri GR', role: 'Developer', sub: '3rd Year CCE', initials: 'DS', img: imgTanya },
  { name: 'Nitin M', role: 'Developer', sub: '3rd Year CCE', initials: 'NM', img: imgNitin },
];

const studentCoordinators = [
  { name: 'VarunKumar S N', role: 'Student Coordinator', sub: '3rd Year CCE', initials: 'VK', img: imgVarunkumar },
  { name: 'Gokulnath N', role: 'Student Coordinator', sub: '3rd Year CCE', initials: 'GK', img: imgGokulnaath },
  { name: 'Rupadharan', role: 'Student Coordinator', sub: '2nd Year CCE', initials: 'RP', img: imgRupadharan },
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
          The dedicated faculty, alumni mentors, and student coordinators driving the AI365 initiative at the Department of Computer and Communication Engineering, Sri Eshwar College of Engineering.
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 mt-16">

      {/* ── Patron & HOD ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Shield} label="Leadership" title="Institutional & Department Leadership" color="bg-slate-100 text-slate-700 border-slate-200" />
        <div className="flex flex-col items-center justify-center gap-8 max-w-md mx-auto">
          <LargePhotoCard
            name={patron.name}
            designation={patron.designation}
            img={patron.img}
            badge="Patron"
            badgeBg="bg-amber-500/10 text-amber-900 border-amber-300"
          />
          <LargePhotoCard
            name={hod.name}
            designation={hod.designation}
            img={hod.img}
            badge="HOD · CCE"
            badgeBg="bg-blue-900/10 text-blue-950 border-blue-200"
          />
        </div>
      </section>

      {/* ── Initiative Lead ─────────────────────────────────────────────── */}
      <section className="space-y-8">
        <SectionHeader icon={Award} label="Core Convener" title="Initiative Lead" color="bg-purple-50 text-purple-700 border-purple-200" />
        <div className="flex justify-center max-w-md mx-auto">
          <LargePhotoCard
            name={initiativeLead.name}
            designation={initiativeLead.designation}
            img={initiativeLead.img}
            badge="Initiative Lead"
            badgeBg="bg-purple-900/10 text-purple-950 border-purple-200"
          />
        </div>
      </section>

      {/* ── Department Coordinators ─────────────────────────────────────── */}
      <section>
        <SectionHeader icon={Users} label="Faculty Support" title="Department Coordinators" color="bg-indigo-50 text-indigo-700 border-indigo-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {coordinators.map((c) => (
            <LargePhotoCard
              key={c.name}
              name={c.name}
              designation={c.designation}
              img={c.img}
              badge="Coordinator"
              badgeBg="bg-indigo-800/10 text-indigo-900 border-indigo-200"
            />
          ))}
        </div>
      </section>

      {/* ── Faculty Mentors ─────────────────────────────────────────────── */}
      <section>
        <SectionHeader icon={GraduationCap} label="Mentors" title="Faculty Mentors" color="bg-amber-50 text-amber-700 border-amber-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {facultyMentors.map((m) => (
            <LargePhotoCard
              key={m.name}
              name={m.name}
              designation={m.designation}
              img={m.img}
              badge="Faculty Mentor"
              badgeBg="bg-amber-800/10 text-amber-800 border-amber-200"
            />
          ))}
        </div>
      </section>

      {/* ── Alumni Mentors ─────────────────────────────────────────────── */}
      <section className="space-y-8">
        <SectionHeader icon={Award} label="Industry Mentors" title="Alumni Mentors" color="bg-sky-50 text-sky-700 border-sky-200" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {alumniMentors.map((a) => (
            <div key={a.name} className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-4 sm:p-5 flex flex-col items-center text-center group hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 w-full">
              <span className="px-3 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-sky-200 mb-3">
                Alumni Mentor
              </span>
              <div className="w-full aspect-[3/4] max-w-[200px] rounded-xl overflow-hidden shadow-sm border border-slate-100 relative group-hover:shadow-md transition-shadow mb-3">
                {a.img ? (
                  <img src={a.img} alt={a.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${a.gradient} flex items-center justify-center`}>
                    <span className="text-3xl font-black text-white">{a.initials}</span>
                  </div>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-[#004990] transition-colors">
                {a.name}
              </h4>
              <div className="mt-2.5 p-2 bg-slate-50 border border-slate-100 rounded-xl w-full max-w-[180px] h-12 flex items-center justify-center">
                <img src={a.logo} alt={a.company} className="max-h-8 max-w-[150px] object-contain" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Student Team & Developers ────────────────────────────────────── */}
      <section className="space-y-10">
        <SectionHeader icon={Users} label="Student Team" title="Student Team & Developers" color="bg-emerald-50 text-emerald-700 border-emerald-200" />

        {/* Featured: Darshan AR */}
        <div className="max-w-[260px] sm:max-w-[280px] mx-auto">
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
            </div>

            {/* Details */}
            <div className="mt-4 mb-2 space-y-1 text-white">
              <h4 className="text-xl font-black tracking-tight group-hover:text-[#F3B631] transition-colors">
                Darshan AR
              </h4>
              <p className="text-xs font-bold text-[#F3B631]">
                Department President
              </p>
            </div>

            <div className="mt-2 pt-3 border-t border-white/10 w-full text-[11px] text-slate-300 font-semibold tracking-wide flex items-center justify-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#F3B631]" /> Built &amp; Designed AI365 Platform
            </div>
          </div>
        </div>

        {/* Developers Row (Tanyasri GR, Nitin M) */}
        <div className="max-w-xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-3">Developers</p>
          <div className="grid grid-cols-2 gap-5">
            {developers.map((s, idx) => (
              <div key={s.name} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${studentGradients[idx % studentGradients.length]} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3 border border-slate-100`}>
                  {s.img ? (
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-white">{s.initials}</span>
                  )}
                </div>
                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-[#004990] text-[9px] font-black uppercase tracking-widest rounded-full mb-1 border border-blue-100">
                  Developer
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
        </div>

        {/* Student Coordinators Row (VarunKumar S N, Gokulnath N, Rupadharan) */}
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 text-center mb-3">Student Coordinators</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {studentCoordinators.map((s, idx) => (
              <div key={s.name} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3.5 flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`w-full aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br ${studentGradients[(idx + 2) % studentGradients.length]} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3 border border-slate-100`}>
                  {s.img ? (
                    <img src={s.img} alt={s.name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-black text-white">{s.initials}</span>
                  )}
                </div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-full mb-1 border border-emerald-100">
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
        </div>
      </section>

    </div>
  </div>
);
