import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../services/api';

interface SearchResult {
  type: string;
  title: string;
  subtitle: string;
  link: string;
}

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await apiFetch<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(data.results || []);
        setOpen(true);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (link: string) => {
    setOpen(false);
    setQuery('');
    navigate(link);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activities, certificates, students, events..."
          className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 placeholder-slate-400 text-xs rounded-xl pl-10 pr-9 py-2.5 border border-transparent focus:border-[#004990] focus:ring-2 focus:ring-[#004990]/20 transition-all outline-none"
        />
        {loading && <Loader2 className="w-4 h-4 absolute right-3 text-slate-400 animate-spin" />}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden max-h-72 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
          {results.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs">No matching results found for "{query}".</div>
          ) : (
            results.map((res, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(res.link)}
                className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">{res.title}</p>
                  <p className="text-[11px] text-slate-500">{res.subtitle}</p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#004990] border border-blue-100">
                  {res.type}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
