import React from 'react';
import { WindingRoadmap } from '../../components/common/WindingRoadmap';

export const Roadmap: React.FC = () => {
  const roadmapMonths = [
    {
      month: 'Month 1-2',
      title: 'AI Foundations & Mathematical Tools',
      topics: 'Python for Data Science, NumPy, Pandas, Linear Algebra, Calculus, and Data Preprocessing',
      badge: 'Explorer Tier',
    },
    {
      month: 'Month 3-4',
      title: 'Classical Machine Learning & Scikit-Learn',
      topics: 'Supervised Learning, Unsupervised Clustering, Feature Engineering, Model Cross-Validation',
      badge: 'Practitioner Tier',
    },
    {
      month: 'Month 5-6',
      title: 'Deep Learning & Neural Networks',
      topics: 'PyTorch Framework, Convolutional Neural Networks (CNNs), Computer Vision, OpenCV',
      badge: 'Specialist Tier',
    },
    {
      month: 'Month 7-8',
      title: 'Natural Language Processing & Generative AI',
      topics: 'Transformers, Hugging Face, LLMs, Retrieval-Augmented Generation (RAG), Fine-Tuning',
      badge: 'Specialist Tier',
    },
    {
      month: 'Month 9-10',
      title: 'Research Methodology & Paper Writing',
      topics: 'Literature Review, Novel Architecture Design, IEEE/Springer Conference Manuscript Drafting',
      badge: 'Researcher Tier',
    },
    {
      month: 'Month 11-12',
      title: 'MLOps, Cloud Deployment & Capstone Hackathon',
      topics: 'Docker, FastAPI, Model Monitoring, AWS SageMaker, Live Product Showcase & Startup Pitch',
      badge: 'Pioneer & Entrepreneur Tier',
    },
  ];

  return (
    <div className="w-full space-y-12 pb-16 font-['Poppins',sans-serif]">
      {/* 6-Step Visual Winding Road Graphic Section */}
      <WindingRoadmap />

      {/* Detailed Module Breakdown */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-block px-3 py-1 bg-blue-100 text-[#004990] font-extrabold text-xs rounded-full uppercase tracking-wider">
            Detailed Module Syllabus
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            12-Month Academic Curriculum Breakdown
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Structured step-by-step milestones created by CCE faculty to take students from basics to deployment & research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roadmapMonths.map((m, idx) => (
            <div key={idx} className="bg-white rounded-[24px] border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#004990] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  {m.month}
                </span>
                <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {m.badge}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{m.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{m.topics}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

