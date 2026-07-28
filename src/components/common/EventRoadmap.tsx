import React from 'react';
import {
  Rocket, Award, FlaskConical, Zap, Lightbulb, FileText,
  Leaf, BookOpen, Hammer, MonitorPlay, GraduationCap, Trophy,
} from 'lucide-react';

const VIEWBOX_W = 1980;
const VIEWBOX_H = 680;
const CONTAINER_H = 680;
const TOP_LABEL_TOP = 12;
const BOTTOM_LABEL_TOP = 494;

const events = [
  { id: 1,  month: "July '26",  title: 'AI Kickstart',              desc: 'Orientation, team formation & AI fundamentals bootcamp',           position: 'top',    x: 100,  y: 240, icon: Rocket },
  { id: 2,  month: "Aug '26",   title: 'Certify AI Marathon',        desc: 'Industry certification drives — NPTEL, Google, AWS & more',        position: 'bottom', x: 260,  y: 400, icon: Award },
  { id: 3,  month: "Sep '26",   title: 'AI ResearchX',              desc: 'Research workshops & IEEE/Springer submissions',                    position: 'top',    x: 420,  y: 240, icon: FlaskConical },
  { id: 4,  month: "Oct '26",   title: 'AgentX Hackfest',           desc: '48-hr hackathon — build AI agents & autonomous systems',           position: 'bottom', x: 580,  y: 400, icon: Zap },
  { id: 5,  month: "Nov '26",   title: 'Faculty AI Innovate',        desc: 'Faculty-led AI solution sprints & mentorship sessions',            position: 'top',    x: 740,  y: 240, icon: Lightbulb },
  { id: 6,  month: "Dec '26",   title: 'PatentX AI',                desc: 'Patent drafting camp — file AI inventions & innovations',          position: 'bottom', x: 900,  y: 400, icon: FileText },
  { id: 7,  month: "Jan '27",   title: 'Sustain AI',                desc: 'AI for sustainability — green tech projects & deployment',         position: 'top',    x: 1060, y: 240, icon: Leaf },
  { id: 8,  month: "Feb '27",   title: 'Certify AI Marathon II',     desc: 'Second round of certification drives & skill-gap workshops',       position: 'bottom', x: 1220, y: 400, icon: BookOpen },
  { id: 9,  month: "Mar '27",   title: 'Build AI',                  desc: 'End-to-end product sprint — from idea to prototype',              position: 'top',    x: 1380, y: 240, icon: Hammer },
  { id: 10, month: "Apr '27",   title: 'BuildFest AI',              desc: 'AI Project Expo: live demos, pitches & startup launches',          position: 'bottom', x: 1540, y: 400, icon: MonitorPlay },
  { id: 11, month: "May '27",   title: 'AI Summer School 2027',      desc: 'Intensive summer programme for advanced AI & research',           position: 'top',    x: 1700, y: 240, icon: GraduationCap },
  { id: 12, month: "June '27",  title: 'AI365 Conclave & Awards',   desc: 'Grand conclave — awards, keynotes & year-end showcase',           position: 'bottom', x: 1860, y: 400, icon: Trophy },
];

const ROAD_PATH =
  'M 20 320 C 60 320, 70 240, 100 240 ' +
  'C 160 240, 200 400, 260 400 ' +
  'C 320 400, 360 240, 420 240 ' +
  'C 480 240, 520 400, 580 400 ' +
  'C 640 400, 680 240, 740 240 ' +
  'C 800 240, 840 400, 900 400 ' +
  'C 960 400, 1000 240, 1060 240 ' +
  'C 1120 240, 1160 400, 1220 400 ' +
  'C 1280 400, 1320 240, 1380 240 ' +
  'C 1440 240, 1480 400, 1540 400 ' +
  'C 1600 400, 1640 240, 1700 240 ' +
  'C 1760 240, 1800 400, 1860 400 ' +
  'C 1920 400, 1940 320, 1960 320';

const arrows = [
  'M 165 265 C 190 340, 225 392, 242 395',
  'M 300 378 C 325 305, 362 248, 382 244',
  'M 485 265 C 510 340, 545 392, 562 395',
  'M 620 378 C 645 305, 682 248, 702 244',
  'M 805 265 C 830 340, 865 392, 882 395',
  'M 960 378 C 985 305, 1022 248, 1042 244',
  'M 1125 265 C 1150 340, 1185 392, 1202 395',
  'M 1280 378 C 1305 305, 1342 248, 1362 244',
  'M 1445 265 C 1470 340, 1505 392, 1522 395',
  'M 1600 378 C 1625 305, 1662 248, 1682 244',
  'M 1765 265 C 1790 340, 1825 392, 1842 395',
];

const nodeTopPx = (y: number) => (y / VIEWBOX_H) * CONTAINER_H;

export const EventRoadmap: React.FC = () => (
  <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif] overflow-hidden">
    <div className="max-w-full mx-auto space-y-10">

      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="flex items-center justify-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E52E00] via-[#FF7A00] to-[#FFA000] p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#FF6A00] rounded-[10px] flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-sm transform rotate-45 shadow-sm" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B1B3D] tracking-tight uppercase">
            12-MONTH AI EVENT ROADMAP
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-2xl text-center">
          Department of Computer and Communication Engineering — July 2026 to June 2027
        </p>
      </div>

      <div className="relative w-full overflow-x-auto pb-4">
        <div className="relative" style={{ minWidth: `${VIEWBOX_W}px`, height: `${CONTAINER_H}px` }}>

          <svg
            className="absolute inset-0 pointer-events-none"
            width={VIEWBOX_W}
            height={CONTAINER_H}
            viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
            preserveAspectRatio="none"
          >
            <defs>
              <radialGradient id="evtNodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor="#FF7A00" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#FF3D00" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="evtOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#FF8A00" />
                <stop offset="100%" stopColor="#E52E00" />
              </linearGradient>
              <marker id="evtArrow" viewBox="0 0 10 10" refX="6" refY="5"
                markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#FF7A00" />
              </marker>
            </defs>
            <path d={ROAD_PATH} fill="none" stroke="#0E1B38" strokeWidth="56" strokeLinecap="round" />
            <path d={ROAD_PATH} fill="none" stroke="#09142A" strokeWidth="48" strokeLinecap="round" />
            <path d={ROAD_PATH} fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeDasharray="14 12" strokeLinecap="round" />
            {arrows.map((d, i) => (
              <path key={i} d={d} fill="none" stroke="#FF7A00" strokeWidth="2.5" markerEnd="url(#evtArrow)" />
            ))}
            {events.map((e) => (
              <g key={e.id}>
                <circle cx={e.x} cy={e.y} r="56" fill="url(#evtNodeGlow)" />
                <circle cx={e.x} cy={e.y} r="36" fill="url(#evtOrangeGrad)" stroke="#FFFFFF" strokeWidth="3" />
              </g>
            ))}
          </svg>

          {events.map((e) => {
            const IconComp   = e.icon;
            const nodeCX     = e.x;
            const nodeCY     = nodeTopPx(e.y);
            const labelTop   = e.position === 'top' ? TOP_LABEL_TOP : BOTTOM_LABEL_TOP;

            return (
              <React.Fragment key={e.id}>
                <div
                  className="absolute z-20 text-white pointer-events-none"
                  style={{ left: nodeCX, top: nodeCY, transform: 'translate(-50%, -50%)' }}
                >
                  <IconComp className="w-6 h-6 drop-shadow-md" />
                </div>

                <div
                  className="absolute z-10 text-center pointer-events-auto transition-transform hover:scale-105"
                  style={{ left: nodeCX, top: labelTop, width: 148, transform: 'translateX(-50%)' }}
                >
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[#FF7A00] text-white text-[9px] font-black uppercase tracking-wider mb-1 shadow-sm whitespace-nowrap">
                    {e.month}
                  </span>
                  <p className="text-[11px] font-extrabold text-slate-900 leading-snug">{e.title}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-normal">{e.desc}</p>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  </section>
);
