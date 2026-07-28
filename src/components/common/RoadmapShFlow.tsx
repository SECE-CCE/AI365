import React, { useState } from 'react';
import {
  Rocket, Award, FlaskConical, Zap, Lightbulb, FileText,
  Leaf, BookOpen, Hammer, MonitorPlay, GraduationCap, Trophy,
  CheckCircle2, ArrowRight, Layers, Sparkles, Compass, HelpCircle,
  Calendar, Check, ChevronDown, ChevronRight
} from 'lucide-react';

interface RoadmapNode {
  id: string;
  phaseNumber: number;
  month: string;
  title: string;
  subtitle: string;
  category: 'curriculum' | 'event' | 'research' | 'certification';
  badgeText: string;
  status: 'Completed' | 'In Progress' | 'Upcoming';
  icon: any;
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  topics: string[];
  keyDeliverable: string;
  description: string;
}

export const RoadmapShFlow: React.FC = () => {
  const [activePhaseTab, setActivePhaseTab] = useState<'phase1' | 'phase2' | 'phase3'>('phase1');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'curriculum' | 'event' | 'research' | 'certification'>('all');
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const phase1Nodes: RoadmapNode[] = [
    {
      id: 'p1-m1',
      phaseNumber: 1,
      month: "July '26 (Month 1-2)",
      title: 'AI Kickstart & Mathematical Foundations',
      subtitle: 'Explorer Tier',
      category: 'curriculum',
      badgeText: 'Core Foundation',
      status: 'In Progress',
      icon: Rocket,
      accentColor: 'text-violet-600',
      bgGradient: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200',
      badgeBg: 'bg-violet-100 text-violet-700',
      topics: ['Python for Data Science', 'NumPy & Vectorization', 'Pandas Preprocessing', 'Linear Algebra & Calculus'],
      keyDeliverable: 'Mathematical AI Diagnostic Test & Git Portfolio Set-up',
      description: 'Orientation, team formation, and building strong computational mathematics & Python data processing fundamentals.'
    },
    {
      id: 'p1-m2',
      phaseNumber: 2,
      month: "Aug '26 (Month 2)",
      title: 'Certify AI Marathon',
      subtitle: 'Practitioner Tier',
      category: 'certification',
      badgeText: 'Global Credentials',
      status: 'Upcoming',
      icon: Award,
      accentColor: 'text-blue-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      badgeBg: 'bg-blue-100 text-blue-700',
      topics: ['NPTEL AI/ML Prep', 'Google Data Analytics', 'AWS ML Foundations', 'Certification Sprints'],
      keyDeliverable: 'Minimum 1 Industry-Recognized AI Certification',
      description: 'Structured certification drive guiding students through globally verified AI credentials and NPTEL course tracking.'
    },
    {
      id: 'p1-m3',
      phaseNumber: 3,
      month: "Sep '26 (Month 3-4)",
      title: 'Classical Machine Learning & AI ResearchX',
      subtitle: 'Practitioner Tier',
      category: 'research',
      badgeText: 'Research & ML',
      status: 'Upcoming',
      icon: FlaskConical,
      accentColor: 'text-cyan-600',
      bgGradient: 'from-cyan-50 to-teal-50',
      borderColor: 'border-cyan-200',
      badgeBg: 'bg-cyan-100 text-cyan-700',
      topics: ['Scikit-Learn Suite', 'Feature Engineering', 'Supervised & Unsupervised Models', 'IEEE Paper Methodology'],
      keyDeliverable: 'Literature Review Draft & ML Model Benchmark Report',
      description: 'Hands-on classical machine learning algorithms combined with formal research methodology and manuscript structure.'
    },
    {
      id: 'p1-m4',
      phaseNumber: 4,
      month: "Oct '26 (Month 4)",
      title: 'AgentX Hackfest',
      subtitle: 'Specialist Tier',
      category: 'event',
      badgeText: '48-Hour Hackathon',
      status: 'Upcoming',
      icon: Zap,
      accentColor: 'text-amber-600',
      bgGradient: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      badgeBg: 'bg-amber-100 text-amber-800',
      topics: ['Autonomous AI Agents', 'Tool Calling & Function Execution', 'Multi-Agent Collaboration', 'Rapid Prototyping'],
      keyDeliverable: 'Functional Working Autonomous AI Agent Prototype',
      description: 'Intensive 48-hour continuous hackathon challenging teams to build real-world autonomous agents and smart workflows.'
    },
    {
      id: 'p1-m5',
      phaseNumber: 5,
      month: "Nov '26 (Month 5-6)",
      title: 'Deep Learning & Faculty AI Innovate',
      subtitle: 'Specialist Tier',
      category: 'curriculum',
      badgeText: 'Neural Networks',
      status: 'Upcoming',
      icon: Lightbulb,
      accentColor: 'text-yellow-600',
      bgGradient: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      badgeBg: 'bg-yellow-100 text-yellow-800',
      topics: ['PyTorch Deep Learning', 'Convolutional Neural Nets (CNN)', 'OpenCV Computer Vision', 'Faculty Mentorship Sprints'],
      keyDeliverable: 'Computer Vision Solution Proof of Concept',
      description: 'Deep neural network architectures, image processing, vision transformers, and direct faculty-led solution mentoring.'
    },
    {
      id: 'p1-m6',
      phaseNumber: 6,
      month: "Dec '26 (Month 6)",
      title: 'PatentX AI Drafting Camp',
      subtitle: 'Researcher Tier',
      category: 'research',
      badgeText: 'IP & Patents',
      status: 'Upcoming',
      icon: FileText,
      accentColor: 'text-rose-600',
      bgGradient: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-200',
      badgeBg: 'bg-rose-100 text-rose-700',
      topics: ['Intellectual Property (IP) Basics', 'Prior Art Search', 'Patent Specification Drafting', 'Indian Patent Office Filing'],
      keyDeliverable: 'Provisional Patent Application Filing Draft',
      description: 'Guiding student-faculty innovation teams through patentability search, legal drafting, and provisional patent filings.'
    },
    {
      id: 'p1-m7',
      phaseNumber: 7,
      month: "Jan '27 (Month 7-8)",
      title: 'Natural Language Processing & Sustain AI',
      subtitle: 'Specialist Tier',
      category: 'curriculum',
      badgeText: 'NLP & Green Tech',
      status: 'Upcoming',
      icon: Leaf,
      accentColor: 'text-emerald-600',
      bgGradient: 'from-emerald-50 to-green-50',
      borderColor: 'border-emerald-200',
      badgeBg: 'bg-emerald-100 text-emerald-700',
      topics: ['Transformers & Hugging Face', 'LLM Fine-Tuning & RAG', 'Green AI & Sustainable Tech', 'Carbon-Efficient ML'],
      keyDeliverable: 'RAG Knowledge Assistant & Sustainability Solution',
      description: 'LLM pipelines, vector databases, Retrieval-Augmented Generation, and deploying AI solutions for environmental sustainability.'
    },
    {
      id: 'p1-m8',
      phaseNumber: 8,
      month: "Feb '27 (Month 8)",
      title: 'Certify AI Marathon II',
      subtitle: 'Specialist Tier',
      category: 'certification',
      badgeText: 'Advanced Certifications',
      status: 'Upcoming',
      icon: BookOpen,
      accentColor: 'text-sky-600',
      bgGradient: 'from-sky-50 to-blue-50',
      borderColor: 'border-sky-200',
      badgeBg: 'bg-sky-100 text-sky-700',
      topics: ['Hugging Face LLM Certs', 'TensorFlow/PyTorch Developer', 'AWS Certified ML Specialty', 'Skill Gap Closure'],
      keyDeliverable: 'Advanced Domain Certification Badge',
      description: 'Second strategic certification drive targeting specialized domain mastery in LLMs, cloud deployment, and MLOps.'
    },
    {
      id: 'p1-m9',
      phaseNumber: 9,
      month: "Mar '27 (Month 9-10)",
      title: 'Build AI & MLOps Infrastructure',
      subtitle: 'Researcher Tier',
      category: 'curriculum',
      badgeText: 'Production Engineering',
      status: 'Upcoming',
      icon: Hammer,
      accentColor: 'text-orange-600',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      badgeBg: 'bg-orange-100 text-orange-700',
      topics: ['Docker Containerization', 'FastAPI Backend Services', 'Model Monitoring & Logging', 'AWS Cloud Deployment'],
      keyDeliverable: 'Production-Ready Web/Cloud AI Prototype',
      description: 'Transforming research models into production APIs, containerized services, and scalable cloud microservices.'
    },
    {
      id: 'p1-m10',
      phaseNumber: 10,
      month: "Apr '27 (Month 10)",
      title: 'BuildFest AI — AI Project Expo',
      subtitle: 'Pioneer & Entrepreneur Tier',
      category: 'event',
      badgeText: 'Grand Milestone Expo',
      status: 'Upcoming',
      icon: MonitorPlay,
      accentColor: 'text-fuchsia-600',
      bgGradient: 'from-fuchsia-50 to-purple-50',
      borderColor: 'border-fuchsia-200',
      badgeBg: 'bg-fuchsia-100 text-fuchsia-700',
      topics: ['Live Product Demonstrations', 'Investor & Industry Pitches', 'Startup Incorporation', 'Excellence Showcase'],
      keyDeliverable: 'Live Public Expo Booth, Demo Video & Investor Pitch Deck',
      description: 'The flagship annual AI Project Expo where student teams launch AI solutions to industry leaders, founders, and investors.'
    },
    {
      id: 'p1-m11',
      phaseNumber: 11,
      month: "May '27 (Month 11)",
      title: 'AI Summer School 2027',
      subtitle: 'Advanced Research Track',
      category: 'curriculum',
      badgeText: 'Advanced Immersion',
      status: 'Upcoming',
      icon: GraduationCap,
      accentColor: 'text-teal-600',
      bgGradient: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200',
      badgeBg: 'bg-teal-100 text-teal-700',
      topics: ['Quantum Machine Learning', 'Reinforcement Learning with Human Feedback (RLHF)', 'Neuro-Symbolic AI', 'Paper Revisions'],
      keyDeliverable: 'Final Camera-Ready IEEE/Springer Conference Paper',
      description: 'Intensive summer research sprint delving into cutting-edge frontier AI paradigms and finalizing journal publications.'
    },
    {
      id: 'p1-m12',
      phaseNumber: 12,
      month: "June '27 (Month 12)",
      title: 'AI365 Grand Conclave & Awards 2027',
      subtitle: 'Pioneer Tier',
      category: 'event',
      badgeText: 'Annual Grand Finale',
      status: 'Upcoming',
      icon: Trophy,
      accentColor: 'text-amber-700',
      bgGradient: 'from-amber-50 to-yellow-100',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-amber-200 text-amber-900',
      topics: ['Year-End Retrospective', 'Best Research & Startup Awards', 'Alumni Network Keynotes', 'Annual Impact Publication'],
      keyDeliverable: 'AI365 Annual Report Release & Award Recognition',
      description: 'Celebrating the 3,000 learning hours, 300 certifications, 30 research papers, 30 AI solutions, and 3 startups created in Phase 1.'
    }
  ];

  const filteredNodes = phase1Nodes.filter(node => {
    if (selectedFilter === 'all') return true;
    return node.category === selectedFilter;
  });

  return (
    <div className="w-full space-y-8 font-['Poppins',sans-serif]">
      {/* ── Top Header & Phase Navigation Tabs ───────────────────────────── */}
      <div className="bg-[#0B132B] rounded-[32px] p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
        {/* Background glow graphics */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Roadmap.sh Inspired Interactive Path
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                CCE AI365 Multi-Year Roadmap
              </h1>
            </div>
            
            {/* Phase Pills Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700/80">
              <button
                onClick={() => setActivePhaseTab('phase1')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  activePhaseTab === 'phase1'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Phase 1 (2026–27)
              </button>
              <button
                onClick={() => setActivePhaseTab('phase2')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  activePhaseTab === 'phase2'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Phase 2 (2027–28)
              </button>
              <button
                onClick={() => setActivePhaseTab('phase3')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  activePhaseTab === 'phase3'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Phase 3 (2028–29)
              </button>
            </div>
          </div>

          {/* Phase 1 Banner / Active Context */}
          {activePhaseTab === 'phase1' && (
            <div className="bg-blue-950/60 border border-blue-800/50 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider rounded-md border border-emerald-500/40">
                    Active Execution Phase
                  </span>
                  <span className="text-slate-400 text-xs font-medium">Academic Year 2026 – 2027</span>
                </div>
                <h3 className="text-lg font-black text-white">Phase 1: Foundation, AI Research & Product Build Sprints</h3>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Phase 1 covers the initial 12 months designed by CCE department faculty to transition students from core Python &amp; Mathematics to paper publication, MLOps, and the flagship <strong>BuildFest AI Expo</strong>.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700/80 text-center">
                  <span className="block text-xs text-slate-400 font-bold">12 Milestones</span>
                  <span className="text-sm font-black text-blue-400">3,000 Hours AI</span>
                </div>
              </div>
            </div>
          )}

          {activePhaseTab === 'phase2' && (
            <div className="bg-purple-950/60 border border-purple-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-wider rounded-md border border-purple-500/40">
                  Planned for Next Year (Phase 2)
                </span>
                <span className="text-slate-400 text-xs font-medium">Academic Year 2027 – 2028</span>
              </div>
              <h3 className="text-lg font-black text-white">Phase 2: Autonomous AI Systems &amp; Enterprise Solutions</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Building upon Phase 1 foundation, Phase 2 will focus on Advanced Multi-Agent Frameworks, Vision Language Models (VLMs), Robotics-AI integration, and scaling student startups into active incubators.
              </p>
            </div>
          )}

          {activePhaseTab === 'phase3' && (
            <div className="bg-amber-950/60 border border-amber-800/50 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider rounded-md border border-amber-500/40">
                  Future Vision (Phase 3)
                </span>
                <span className="text-slate-400 text-xs font-medium">Academic Year 2028 – 2029</span>
              </div>
              <h3 className="text-lg font-black text-white">Phase 3: Global IP Portfolio, Commercialization &amp; Frontier AI Labs</h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                Phase 3 expands CCE AI365 into international research collaborations, commercial enterprise licenses, venture funding showcase, and dedicated AI research labs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Category Filter Buttons ────────────────────────────────────────── */}
      {activePhaseTab === 'phase1' && (
        <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1 shrink-0">
              <Compass className="w-4 h-4 text-blue-600" /> Filter Track:
            </span>
            {[
              { key: 'all', label: 'All Tracks' },
              { key: 'curriculum', label: 'Academic Curriculum' },
              { key: 'event', label: 'Hackathons & Expos' },
              { key: 'research', label: 'Research & Patents' },
              { key: 'certification', label: 'Certifications' }
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setSelectedFilter(f.key as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedFilter === f.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline-block">
            Showing {filteredNodes.length} of 12 Phase 1 Nodes
          </span>
        </div>
      )}

      {/* ── Roadmap.sh Connected Nodes Container (Phase 1) ───────────────── */}
      {activePhaseTab === 'phase1' ? (
        <div className="relative max-w-6xl mx-auto py-6">
          {/* Central vertical connecting line for desktop flow */}
          <div className="hidden lg:block absolute left-1/2 top-10 bottom-10 w-1 bg-gradient-to-b from-violet-500 via-blue-500 to-amber-500 -translate-x-1/2 rounded-full opacity-30" />

          <div className="space-y-8 relative">
            {filteredNodes.map((node, index) => {
              const IconComp = node.icon;
              const isEven = index % 2 === 0;
              const isExpanded = expandedNode === node.id;

              return (
                <div
                  key={node.id}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  } gap-6 group`}
                >
                  {/* Card box */}
                  <div className="w-full lg:w-1/2">
                    <div
                      className={`bg-white rounded-[24px] border ${node.borderColor} p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                        node.id === 'p1-m10' ? 'ring-2 ring-fuchsia-500/50 shadow-fuchsia-100' : ''
                      }`}
                    >
                      {/* Top bar */}
                      <div className={`h-1.5 w-full bg-gradient-to-r ${node.bgGradient} absolute top-0 left-0 right-0`} />

                      <div className="space-y-4 pt-2">
                        {/* Badges row */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${node.badgeBg}`}>
                            {node.badgeText}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            {node.month}
                          </span>
                        </div>

                        {/* Title & icon */}
                        <div className="flex items-start gap-3.5">
                          <div className={`w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform ${node.accentColor}`}>
                            <IconComp className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                              {node.title}
                            </h3>
                            <span className="text-xs font-semibold text-slate-500">{node.subtitle}</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {node.description}
                        </p>

                        {/* Topics Pill Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {node.topics.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg"
                            >
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Deliverable highlight */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold text-slate-900">Key Milestone: </span>
                            <span className="font-medium text-slate-600">{node.keyDeliverable}</span>
                          </div>
                        </div>

                        {/* BuildFest Highlight Banner inside Node 10 */}
                        {node.id === 'p1-m10' && (
                          <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-between">
                            <span>🚀 BuildFest AI Flagship Event (April 2027)</span>
                            <span className="bg-white text-fuchsia-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                              Campus Expo
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center Node Indicator for Desktop */}
                  <div className="hidden lg:flex items-center justify-center relative z-20 shrink-0">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white border-4 border-white shadow-xl flex items-center justify-center text-xs font-black group-hover:scale-125 transition-transform">
                      {index + 1}
                    </div>
                  </div>

                  {/* Empty side for balanced grid layout */}
                  <div className="hidden lg:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Future Phases Placeholder Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-8">
          <div className="bg-white rounded-[24px] border border-slate-200 p-8 space-y-4 shadow-sm">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-black text-xs uppercase">
              Phase 2 Preview (2027 – 2028)
            </span>
            <h3 className="text-xl font-black text-slate-900">Autonomous Agents &amp; VLM Architectures</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transitioning from individual AI applications to multi-agent autonomous frameworks, vision-language model integration, and enterprise AI consulting projects led by CCE students.
            </p>
            <ul className="text-xs font-semibold text-slate-700 space-y-2 pt-2">
              <li className="flex items-center gap-2">✓ Advanced LangChain &amp; LlamaIndex Workflows</li>
              <li className="flex items-center gap-2">✓ Vision-Language Models (VLM) for Industrial Inspection</li>
              <li className="flex items-center gap-2">✓ Incubator Pitch &amp; Pre-Seed Funding Drives</li>
            </ul>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 p-8 space-y-4 shadow-sm">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-black text-xs uppercase">
              Phase 3 Preview (2028 – 2029)
            </span>
            <h3 className="text-xl font-black text-slate-900">Commercialization &amp; Frontier AI Labs</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scaling intellectual property into active commercial spinoffs, international IEEE conference presentations, and dedicated departmental AI incubators.
            </p>
            <ul className="text-xs font-semibold text-slate-700 space-y-2 pt-2">
              <li className="flex items-center gap-2">✓ Patent Commercialization &amp; Licensing</li>
              <li className="flex items-center gap-2">✓ Global AI Research Exchange Programs</li>
              <li className="flex items-center gap-2">✓ Enterprise AI Hackathons &amp; Venture Funding</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
