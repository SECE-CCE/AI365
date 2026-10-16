import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Sparkles, ArrowRight, X, Rocket, Lightbulb, FileText, Award, Clock } from 'lucide-react';

const STORAGE_KEY = 'ai365_visitor_welcome_seen';

// Modern electric color palette: electric blue, purple, cyan, white, with subtle gold accent
const CONFETTI_COLORS = [
  '#0066FF', // Electric Blue
  '#00C2FF', // Vivid Cyan
  '#8A2BE2', // Blue Violet
  '#7928CA', // Neon Purple
  '#00F5FF', // Cyan Glow
  '#FFFFFF', // Crisp White
  '#F3B631', // SECE Innovation Gold
];

export const WelcomeExperience: React.FC = () => {
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const confettiIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to safely access localStorage without throwing in private/restricted environments
  const checkFirstTimeVisitor = useCallback((): boolean => {
    try {
      if (typeof window === 'undefined') return false;

      // Allow test query parameter e.g. ?welcome=true to preview anytime
      const params = new URLSearchParams(window.location.search);
      if (params.get('welcome') === 'true' || params.get('welcome') === 'preview') {
        return true;
      }

      // Check localStorage flag
      const seen = window.localStorage.getItem(STORAGE_KEY);
      return !seen;
    } catch (e) {
      // In case localStorage is blocked, avoid crashing and return false to be safe
      return false;
    }
  }, []);

  const markVisitorAsWelcomed = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      }
    } catch (_) {
      // Ignore quota/security errors gracefully
    }
  }, []);

  const triggerConfettiCelebration = useCallback(() => {
    // Check reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    try {
      // 1. Center initial high-energy burst
      confetti({
        particleCount: 75,
        spread: 90,
        origin: { x: 0.5, y: 0.55 },
        colors: CONFETTI_COLORS,
        disableForReducedMotion: true,
        zIndex: 99999,
      });

      // 2. Twin cannons from bottom corners
      setTimeout(() => {
        confetti({
          particleCount: 45,
          angle: 60,
          spread: 60,
          origin: { x: 0.05, y: 0.8 },
          colors: CONFETTI_COLORS,
          disableForReducedMotion: true,
          zIndex: 99999,
        });
        confetti({
          particleCount: 45,
          angle: 120,
          spread: 60,
          origin: { x: 0.95, y: 0.8 },
          colors: CONFETTI_COLORS,
          disableForReducedMotion: true,
          zIndex: 99999,
        });
      }, 350);

      // 3. Gentle fireworks cadence across 3 seconds
      const celebrationEnd = Date.now() + 2800;
      confettiIntervalRef.current = setInterval(() => {
        if (Date.now() > celebrationEnd) {
          if (confettiIntervalRef.current) {
            clearInterval(confettiIntervalRef.current);
            confettiIntervalRef.current = null;
          }
          return;
        }

        confetti({
          particleCount: 25,
          startVelocity: 25,
          spread: 360,
          ticks: 60,
          origin: {
            x: Math.random() * 0.5 + 0.25,
            y: Math.random() * 0.4 + 0.2,
          },
          colors: CONFETTI_COLORS,
          disableForReducedMotion: true,
          zIndex: 99999,
        });
      }, 550);
    } catch (err) {
      console.warn('Confetti animation error:', err);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (isDismissing) return;
    setIsDismissing(true);

    // Stop confetti interval immediately
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }

    // Persist flag to localStorage so it never triggers again
    markVisitorAsWelcomed();

    // Smooth exit transition before unmounting
    setTimeout(() => {
      setShouldRender(false);
      setIsDismissing(false);
    }, 500);
  }, [isDismissing, markVisitorAsWelcomed]);

  useEffect(() => {
    // Avoid showing on login or registration pages to preserve clean auth flow
    if (location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    const isFirstTime = checkFirstTimeVisitor();
    if (!isFirstTime) return;

    // Immediately record that the welcome was shown
    markVisitorAsWelcomed();

    // Trigger mount and entrance
    setShouldRender(true);

    // Small timeout to allow DOM node to render before applying entrance scale/opacity transition
    const enterTimeout = setTimeout(() => {
      setIsEntering(true);
      triggerConfettiCelebration();
    }, 60);

    // Auto-dismiss after 8 seconds of inactivity so user can freely read, then resume
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, 8500);

    return () => {
      clearTimeout(enterTimeout);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    };
  }, [location.pathname, checkFirstTimeVisitor, markVisitorAsWelcomed, triggerConfettiCelebration, handleDismiss]);

  if (!shouldRender) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to AI365CCE"
      className={`fixed inset-0 z-[99998] flex items-center justify-center p-4 sm:p-6 transition-all duration-500 ease-out ${
        isDismissing
          ? 'opacity-0 pointer-events-none'
          : isEntering
          ? 'opacity-100 pointer-events-auto backdrop-blur-md bg-[#00142E]/70'
          : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        // Dismiss if clicking backdrop outside dialog card
        if (e.target === e.currentTarget) {
          handleDismiss();
        }
      }}
    >
      {/* Background Futuristic Ambient Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-[#004990]/30 rounded-full blur-[160px]" />
      </div>

      {/* Main Welcome Modal Card */}
      <div
        className={`relative w-full max-w-lg bg-[#001E42]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(0,194,255,0.22)] backdrop-blur-2xl text-center transform transition-all duration-500 ease-out overflow-hidden ${
          isDismissing
            ? 'scale-95 opacity-0'
            : isEntering
            ? 'scale-100 opacity-100'
            : 'scale-90 opacity-0'
        }`}
      >
        {/* Top subtle decorative neon grid line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          aria-label="Close welcome message"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <X className="w-4 h-4" />
        </button>

        {/* AI Portal Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-5 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-[#F3B631] animate-spin" style={{ animationDuration: '6s' }} />
          <span>AI365 @ CCE Initiative</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </div>

        {/* Centered Heading */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
          🎉 Welcome to{' '}
          <span className="bg-gradient-to-r from-cyan-300 via-blue-200 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
            AI365CCE!
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto mb-4">
          Your journey into <span className="text-cyan-300 font-semibold">Artificial Intelligence</span>, Technology, and Innovation starts here.
        </p>

        {/* Poster Commitments Badge */}
        <div className="mb-3 px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700/60 inline-flex items-center gap-2">
          <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">
            Our Commitments for 2026–2027
          </span>
          <span className="text-[10px] text-slate-400">• Ambitious Goals &amp; Measurable Impact</span>
        </div>

        {/* 5 Commitments Grid (Matching CCE Poster) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mb-6 text-left">
          {/* 3000 Hours */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-blue-500/30 hover:border-blue-400 transition-colors col-span-2 sm:col-span-1">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0 border border-blue-400/30">
              <Clock className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white leading-tight">3000 Hours</p>
              <p className="text-[9px] text-slate-300 leading-tight truncate">AI Learning &amp; Projects</p>
            </div>
          </div>

          {/* 300 Certifications */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-emerald-500/30 hover:border-emerald-400 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0 border border-emerald-400/30">
              <Award className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white leading-tight">300 Certs</p>
              <p className="text-[9px] text-slate-300 leading-tight truncate">Global AI Credentials</p>
            </div>
          </div>

          {/* 30 Research Articles */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-cyan-500/30 hover:border-cyan-400 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center shrink-0 border border-cyan-400/30">
              <FileText className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white leading-tight">30 Research</p>
              <p className="text-[9px] text-slate-300 leading-tight truncate">Scopus Publications</p>
            </div>
          </div>

          {/* 30 AI Solutions */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-amber-500/30 hover:border-amber-400 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Lightbulb className="w-4 h-4 text-amber-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white leading-tight">30 Solutions</p>
              <p className="text-[9px] text-slate-300 leading-tight truncate">Industry &amp; Society</p>
            </div>
          </div>

          {/* 3 AI Startups */}
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/50 border border-purple-500/30 hover:border-purple-400 transition-colors col-span-1 sm:col-span-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center shrink-0 border border-purple-400/30">
              <Rocket className="w-4 h-4 text-purple-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-white leading-tight">3 AI Startups</p>
              <p className="text-[9px] text-slate-300 leading-tight truncate">Impactful AI Ventures</p>
            </div>
          </div>
        </div>

        {/* Action Button: "Let's Explore" */}
        <button
          onClick={handleDismiss}
          className="w-full group relative inline-flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#004990] via-[#0066FF] to-[#00C2FF] text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-[0_0_25px_rgba(0,194,255,0.4)] hover:shadow-[0_0_35px_rgba(0,194,255,0.6)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer border border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <span>Let&apos;s Explore</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[10px] text-slate-400 mt-3 font-medium">
          Sri Eshwar College of Engineering • Dept. of CCE
        </p>
      </div>
    </div>
  );
};

export default WelcomeExperience;
