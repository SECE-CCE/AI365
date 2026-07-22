import React from 'react';
import { Sparkles, Target, Award, Shield, Cpu, BookOpen } from 'lucide-react';
import { Card } from '../../components/common/Card';

export const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-['Poppins',sans-serif]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-full uppercase tracking-wider">
          About AI365 @ CCE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Department of Computer & Communication Engineering
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Transforming engineering education by embedding continuous AI activity tracking, industry certification verification, and research publication workflows directly into the academic journey.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Our Department Vision" subtitle="Building an AI-Ready Generation">
          <p className="text-xs text-slate-600 leading-relaxed">
            To emerge as a premier center of academic excellence and research in Computer and Communication Engineering, nurturing students with cutting-edge AI skills, ethical responsibility, and innovative problem-solving mindsets needed to tackle global technological challenges.
          </p>
        </Card>

        <Card title="The AI365 Platform Mission" subtitle="Empowering 365 Days of Continuous AI Learning">
          <p className="text-xs text-slate-600 leading-relaxed">
            AI365 @ CCE serves as a unified digital ecosystem where every student tracks verified learning hours, earns industry certifications from AWS, NVIDIA, and Google, publishes research manuscripts, and builds real-world AI prototypes verified by department mentors.
          </p>
        </Card>
      </div>

      {/* Core Pillars */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900 text-center">4 Pillars of CCE AI Excellence</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-6 bg-white rounded-[20px] border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#004990] flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Continuous Learning</h3>
            <p className="text-slate-600 leading-relaxed">
              Students log online course hours from Coursera, NPTEL, and NVIDIA DLI throughout the year.
            </p>
          </div>

          <div className="p-6 bg-white rounded-[20px] border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Industry Certification</h3>
            <p className="text-slate-600 leading-relaxed">
              Direct verification of cloud, MLOps, and deep learning industry credentials for career readiness.
            </p>
          </div>

          <div className="p-6 bg-white rounded-[20px] border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">Research & Publications</h3>
            <p className="text-slate-600 leading-relaxed">
              Mentorship for submitting high-impact IEEE, Springer, and Scopus conference papers.
            </p>
          </div>

          <div className="p-6 bg-white rounded-[20px] border border-slate-200/80 shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">AI Prototypes</h3>
            <p className="text-slate-600 leading-relaxed">
              Building working AI prototypes, GitHub repositories, and participating in national hackathons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
