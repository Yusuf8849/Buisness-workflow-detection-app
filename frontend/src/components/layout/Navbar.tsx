import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  LayoutGrid,
  Search,
  BarChart3,
  History,
  Play,
  Zap,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { soundFX } from '../../utils/audioEffects';

export type ActiveTab = 'overview' | 'studio' | 'discover' | 'analytics' | 'history';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenDemo: () => void;
  onOpenMagicMoment?: () => void;
  onOpenTutorial?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenDemo,
  onOpenMagicMoment,
  onOpenTutorial
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme State with localStorage Persistence & System Preference Fallback
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flowintel_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('flowintel_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    soundFX.playClick();
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const navTabs: Array<{ id: ActiveTab; label: string; icon: any }> = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'studio', label: 'Studio', icon: LayoutGrid },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Repository', icon: History },
  ];

  const handleTabClick = (id: ActiveTab) => {
    soundFX.playClick();
    onSelectTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-black/[0.05] dark:border-white/[0.08] bg-white/[0.85] dark:bg-[#0a0e1a]/80 backdrop-blur-[20px] shadow-sm dark:shadow-2xl transition-colors">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[70px] flex items-center justify-between gap-3 sm:gap-6 py-2.5">
          {/* Left: Logo with Animated Gradient Text (shrink-0 prevents squishing or overlapping) */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer group select-none"
            onClick={() => handleTabClick('overview')}
          >
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00b4d8] via-[#7c3aed] to-[#2563eb] p-[1.5px] shadow-[0_0_20px_rgba(0,180,216,0.35)] group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full rounded-2xl bg-white dark:bg-[#0a0e1a] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#00b4d8] fill-current animate-pulse" />
              </div>
            </div>

            <div className="shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black font-display tracking-tight bg-gradient-to-r from-[#00b4d8] via-[#38bdf8] to-[#7c3aed] bg-clip-text text-transparent animate-gradient-x">
                  FlowIntel<span className="text-[#00b4d8]">.AI</span>
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
                Business Workflow Detection & Diagram Generation
              </p>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs with 2px #00b4d8 Underline */}
          <nav aria-label="Desktop Navigation" className="hidden lg:flex items-center gap-1 p-1 bg-slate-100/90 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl backdrop-blur-[20px] shrink-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer min-h-[40px] shrink-0 ${
                    isActive
                      ? 'text-[#00b4d8] bg-white dark:bg-white/[0.08] shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-[#0f172a] dark:hover:text-[#e8edf5]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00b4d8]' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>

                  {/* 2px #00b4d8 Active Tab Underline */}
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-2 h-[2px] bg-[#00b4d8] shadow-[0_0_8px_rgba(0,180,216,0.6)] rounded-full animate-node-pop" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions, Search, Theme Toggle, & Demo Mode Badge */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Quick Search Input */}
            <div className="relative hidden 2xl:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workflows..."
                className="w-36 sm:w-44 px-3.5 py-1.5 pl-8 rounded-2xl bg-white dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.12] text-xs font-mono text-[#0f172a] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#00b4d8] focus:ring-2 focus:ring-[#00b4d8]/20 transition-all shadow-sm"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Dark / Light Mode Toggle Pill */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.14] border border-slate-200 dark:border-white/[0.18] hover:border-[#00b4d8] text-[#0f172a] dark:text-slate-200 transition-all cursor-pointer min-h-[40px] shadow-sm button-scale shrink-0"
              title={theme === 'dark' ? 'Click to switch to Light Mode' : 'Click to switch to Dark Mode'}
              aria-label="Toggle Dark or Light Mode"
            >
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xl flex items-center justify-center transition-all ${
                theme === 'dark' 
                  ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                  : 'bg-amber-100 text-amber-600 border border-amber-300'
              }`}>
                {theme === 'dark' ? (
                  <Sun className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 animate-pulse" />
                ) : (
                  <Moon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#6d28d9]" />
                )}
              </div>
              <span className="text-xs font-mono font-bold tracking-tight hidden sm:inline">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
            </button>

            {/* Onboarding Tour Button */}
            {onOpenTutorial && (
              <button
                type="button"
                onClick={onOpenTutorial}
                className="hidden xl:flex px-3 py-2 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-[#00b4d8] text-xs font-mono text-[#0f172a] dark:text-slate-300 hover:text-[#00b4d8] items-center gap-1.5 cursor-pointer transition-all min-h-[40px] shadow-sm shrink-0"
                title="Open Interactive 3-Step Onboarding Tour"
              >
                <span>🎓</span>
                <span>Tour</span>
              </button>
            )}

            {/* Magic Moment Eureka Button */}
            {onOpenMagicMoment && (
              <button
                type="button"
                onClick={onOpenMagicMoment}
                className="hidden sm:flex px-3.5 py-2 rounded-2xl text-xs font-mono font-bold items-center gap-1.5 cursor-pointer bg-gradient-to-r from-[#6d28d9] to-[#4f46e5] text-white shadow-[0_4px_16px_rgba(109,40,217,0.3)] hover:shadow-[0_6px_22px_rgba(109,40,217,0.45)] transition-all min-h-[40px] button-scale shrink-0"
                title="Trigger The Magic Moment Eureka Reveal"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-200 animate-spin" />
                <span>Magic Moment</span>
              </button>
            )}

            {/* Demo Mode Badge */}
            <button
              type="button"
              onClick={onOpenDemo}
              className="px-3.5 sm:px-4 py-2 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs font-mono flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all min-h-[40px] button-scale animate-pulse shrink-0"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Demo Mode</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-2xl bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.12] text-[#0f172a] dark:text-slate-300 hover:text-[#00b4d8] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer shadow-sm shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-18 bg-white/95 dark:bg-[#0a0e1a]/95 border-b border-slate-200 dark:border-white/[0.1] backdrop-blur-[24px] p-4 space-y-2 z-50 shadow-2xl animate-node-pop">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-mono font-bold transition-all min-h-[48px] ${
                  isActive
                    ? 'text-[#00b4d8] bg-[#00b4d8]/10 border border-[#00b4d8]/30 shadow-sm'
                    : 'text-[#0f172a] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#00b4d8]" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-[#0f172a] dark:text-slate-300 min-h-[44px]"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-[#6d28d9]" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {onOpenTutorial && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTutorial();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-[#0f172a] dark:text-slate-300 min-h-[44px]"
              >
                <span>🎓 Onboarding Tour</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
