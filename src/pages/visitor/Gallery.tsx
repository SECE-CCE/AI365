import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

export const Gallery: React.FC = () => {
  const photos = [
    {
      title: 'CCE Innovation & AI Hardware Lab',
      category: 'Campus Facilities',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
    },
    {
      title: 'National AI & Robotics Hackathon 2026',
      category: 'Department Events',
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
    },
    {
      title: 'NVIDIA Deep Learning Institute Hands-On Workshop',
      category: 'Workshops',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
    },
    {
      title: 'IEEE Research Paper Presentation Session',
      category: 'Conferences',
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 font-['Poppins',sans-serif]">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="inline-block px-3 py-1 bg-blue-100 text-[#004990] font-extrabold text-xs rounded-full uppercase tracking-wider">
          Life at CCE
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          CCE Department Gallery
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          Glimpses of hackathons, AI research seminars, laboratory sessions, and student innovation showcases.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {photos.map((item, idx) => (
          <div key={idx} className="bg-white rounded-[24px] border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all group">
            <div className="h-64 bg-slate-800 overflow-hidden relative">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
              />
              <span className="absolute top-4 left-4 bg-[#002B5C] text-[#F3B631] font-bold text-[10px] px-3 py-1 rounded-full uppercase border border-amber-300/30">
                {item.category}
              </span>
            </div>
            <div className="p-6">
              <h3 className="font-extrabold text-slate-900 text-lg">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
