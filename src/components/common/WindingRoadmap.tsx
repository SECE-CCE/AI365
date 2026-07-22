import React from 'react';
import { Target, Search, MessageSquare, Puzzle, MapPin, Share2 } from 'lucide-react';

export const WindingRoadmap: React.FC = () => {
  const steps = [
    {
      id: 1,
      stepNumber: 'Step 1',
      title: 'Set goals for your project',
      description: 'AI Foundations, Python, Linear Algebra & Pandas Data Preprocessing',
      position: 'top',
      x: 180,
      y: 180,
      icon: Target,
    },
    {
      id: 2,
      stepNumber: 'Step 2',
      title: 'Define the type of roadmap',
      description: 'Classical Machine Learning, Supervised Learning & Scikit-Learn',
      position: 'bottom',
      x: 360,
      y: 300,
      icon: Search,
    },
    {
      id: 3,
      stepNumber: 'Step 3',
      title: 'Involve your stakeholders',
      description: 'Deep Learning, PyTorch, Computer Vision & CNN Architectures',
      position: 'top',
      x: 540,
      y: 180,
      icon: MessageSquare,
    },
    {
      id: 4,
      stepNumber: 'Step 4',
      title: 'Work out your structures and processes',
      description: 'Natural Language Processing, Transformers, LLMs & RAG Pipelines',
      position: 'bottom',
      x: 720,
      y: 300,
      icon: Puzzle,
    },
    {
      id: 5,
      stepNumber: 'Step 5',
      title: 'Create your roadmap',
      description: 'Research Methodology, Novel Architecture & IEEE Manuscript Drafting',
      position: 'top',
      x: 900,
      y: 180,
      icon: MapPin,
    },
    {
      id: 6,
      stepNumber: 'Step 6',
      title: 'Make sure you regularly adapt and communicate changes',
      description: 'MLOps, Docker, FastAPI, AWS Cloud Deployment & Startup Pitch',
      position: 'bottom',
      x: 1080,
      y: 300,
      icon: Share2,
    },
  ];

  return (
    <section className="w-full bg-white py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif] overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header with Logo matching reference image */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-center gap-3.5">
            {/* Orange Stacked Gem Logo Icon matching reference screenshot */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#E52E00] via-[#FF7A00] to-[#FFA000] p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#FF6A00] rounded-[10px] flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-xs transform rotate-45 shadow-xs" />
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0B1B3D] tracking-tight uppercase">
              HOW TO CREATE A ROADMAP IN 6 STEPS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-2xl text-center">
            Department of Computer and Communication Engineering — 12-Month AI Progression Path
          </p>
        </div>

        {/* Winding S-Curve Road Graphic */}
        <div className="relative w-full overflow-x-auto pb-8">
          <div className="min-w-[1020px] relative h-[500px] flex items-center justify-center">
            {/* SVG Canvas */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 1200 480"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF7A00" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#FF3D00" stopOpacity="0" />
                </radialGradient>

                <linearGradient id="orangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF8A00" />
                  <stop offset="100%" stopColor="#E52E00" />
                </linearGradient>

                <marker
                  id="orangeArrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#FF7A00" />
                </marker>
              </defs>

              {/* Outer Dark Navy Winding Road */}
              <path
                d="M 60 240 C 110 240, 130 180, 180 180 C 250 180, 290 300, 360 300 C 430 300, 470 180, 540 180 C 610 180, 650 300, 720 300 C 790 300, 830 180, 900 180 C 970 180, 1010 300, 1080 300 C 1130 300, 1150 240, 1170 240"
                fill="none"
                stroke="#0E1B38"
                strokeWidth="50"
                strokeLinecap="round"
              />

              {/* Inner Dark Layer */}
              <path
                d="M 60 240 C 110 240, 130 180, 180 180 C 250 180, 290 300, 360 300 C 430 300, 470 180, 540 180 C 610 180, 650 300, 720 300 C 790 300, 830 180, 900 180 C 970 180, 1010 300, 1080 300 C 1130 300, 1150 240, 1170 240"
                fill="none"
                stroke="#09142A"
                strokeWidth="44"
                strokeLinecap="round"
              />

              {/* White Dashed Lane Divider */}
              <path
                d="M 60 240 C 110 240, 130 180, 180 180 C 250 180, 290 300, 360 300 C 430 300, 470 180, 540 180 C 610 180, 650 300, 720 300 C 790 300, 830 180, 900 180 C 970 180, 1010 300, 1080 300 C 1130 300, 1150 240, 1170 240"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeDasharray="14 12"
                strokeLinecap="round"
              />

              {/* Curved Orange Flow Arrows */}
              <path
                d="M 220 200 C 245 270, 290 300, 320 290"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="2.5"
                markerEnd="url(#orangeArrow)"
              />
              <path
                d="M 400 280 C 425 210, 470 180, 500 190"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="2.5"
                markerEnd="url(#orangeArrow)"
              />
              <path
                d="M 580 200 C 605 270, 650 300, 680 290"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="2.5"
                markerEnd="url(#orangeArrow)"
              />
              <path
                d="M 760 280 C 785 210, 830 180, 860 190"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="2.5"
                markerEnd="url(#orangeArrow)"
              />
              <path
                d="M 940 200 C 965 270, 1010 300, 1040 290"
                fill="none"
                stroke="#FF7A00"
                strokeWidth="2.5"
                markerEnd="url(#orangeArrow)"
              />

              {/* Node Circles */}
              {steps.map((s) => (
                <g key={s.id}>
                  <circle cx={s.x} cy={s.y} r="54" fill="url(#nodeGlow)" />
                  <circle cx={s.x} cy={s.y} r="34" fill="url(#orangeGrad)" stroke="#FFFFFF" strokeWidth="3" />
                </g>
              ))}
            </svg>

            {/* Icons and Text Overlay with Clean Vertical Offsets */}
            {steps.map((s) => {
              const IconComp = s.icon;
              const leftPercent = (s.x / 1200) * 100;
              const topPercent = (s.y / 480) * 100;

              return (
                <React.Fragment key={s.id}>
                  {/* Icon centered inside node circle */}
                  <div
                    className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none"
                    style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
                  >
                    <IconComp className="w-7 h-7 drop-shadow-md" />
                  </div>

                  {/* Step Title & Subtitle Text: Positioned cleanly ABOVE or BELOW node */}
                  <div
                    className={`absolute z-10 transform -translate-x-1/2 text-center w-56 pointer-events-auto transition-transform hover:scale-105 ${
                      s.position === 'top' ? 'bottom-[69%]' : 'top-[69%]'
                    }`}
                    style={{ left: `${leftPercent}%` }}
                  >
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                      {s.stepNumber}
                    </h3>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1 leading-snug">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium mt-1 leading-normal">
                      {s.description}
                    </p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
