'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function Navbar({ locale }: { locale: string }) {
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isBn = locale === 'bn';
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('darkMode');
    const isDark = saved !== null ? saved === 'true' : true;
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from('profiles').select('role').eq('id', data.user.id).single()
          .then(({ data: profile }) => {
            if (profile?.role === 'admin') setIsAdmin(true);
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubjectOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    document.documentElement.classList.toggle('dark', newMode);
    document.documentElement.classList.toggle('light', !newMode);
  };

  const toggleLocale = () => {
    const newLocale = locale === 'en' ? 'bn' : 'en';
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const scienceSubjects = [
    { slug: 'physics-1',     en: 'Physics I',      bn: 'পদার্থবিজ্ঞান ১', icon: '⚛' },
    { slug: 'physics-2',     en: 'Physics II',     bn: 'পদার্থবিজ্ঞান ২', icon: '⚛' },
    { slug: 'chemistry-1',   en: 'Chemistry I',    bn: 'রসায়ন ১',         icon: '🧪' },
    { slug: 'chemistry-2',   en: 'Chemistry II',   bn: 'রসায়ন ২',         icon: '🧪' },
    { slug: 'biology-1',     en: 'Biology I',      bn: 'জীববিজ্ঞান ১',    icon: '🧬' },
    { slug: 'biology-2',     en: 'Biology II',     bn: 'জীববিজ্ঞান ২',    icon: '🧬' },
    { slug: 'higher-math-1', en: 'Higher Math I',  bn: 'উচ্চতর গণিত ১',   icon: '∫' },
    { slug: 'higher-math-2', en: 'Higher Math II', bn: 'উচ্চতর গণিত ২',   icon: '∫' },
  ];

  const otherSubjects = [
    { slug: 'bangla-1',  en: 'Bangla I',   bn: 'বাংলা ১',    icon: '📖' },
    { slug: 'bangla-2',  en: 'Bangla II',  bn: 'বাংলা ২',    icon: '📖' },
    { slug: 'english-1', en: 'English I',  bn: 'ইংরেজি ১',   icon: '🔤' },
    { slug: 'english-2', en: 'English II', bn: 'ইংরেজি ২',   icon: '🔤' },
    { slug: 'ict',       en: 'ICT',        bn: 'তথ্য প্রযুক্তি', icon: '💻' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-white/[0.06] bg-white/90 dark:bg-[#030712]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
            style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>Σ</div>
          <span className="font-bold text-gray-900 dark:text-white text-sm hidden sm:block">
            {isBn ? 'এইচএসসি বিজ্ঞান' : 'HSC Science'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 text-sm">
          {/* Subjects Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSubjectOpen(!subjectOpen)}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              {isBn ? 'বিষয়সমূহ' : 'Subjects'}
              <span className={`transition-transform duration-200 ${subjectOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {subjectOpen && (
              <div className="absolute top-full left-0 mt-2 w-[520px] bg-white dark:bg-[#0f1b2d] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#00c896] mb-2 uppercase tracking-wider">
                    {isBn ? 'বিজ্ঞান' : 'Science'}
                  </div>
                  {scienceSubjects.map(s => (
                    <Link key={s.slug} href={`/${locale}/subjects/${s.slug}`}
                      onClick={() => setSubjectOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 text-sm">
                      <span>{s.icon}</span>
                      <span>{isBn ? s.bn : s.en}</span>
                    </Link>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#00a8ff] mb-2 uppercase tracking-wider">
                    {isBn ? 'অন্যান্য' : 'Others'}
                  </div>
                  {otherSubjects.map(s => (
                    <Link key={s.slug} href={`/${locale}/subjects/${s.slug}`}
                      onClick={() => setSubjectOpen(false)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300 text-sm">
                      <span>{s.icon}</span>
                      <span>{isBn ? s.bn : s.en}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href={`/${locale}/graph`}
            className="px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
            {isBn ? 'গ্রাফ' : 'Graph'}
          </Link>

          {isAdmin && (
            <Link href={`/${locale}/admin`}
              className="px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
              {isBn ? 'অ্যাডমিন' : 'Admin'}
            </Link>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {mounted && (
            <button onClick={toggleDarkMode}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all text-sm">
              {darkMode ? '☀️' : '🌙'}
            </button>
          )}
          <button onClick={toggleLocale}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
            {isBn ? 'EN' : 'বাং'}
          </button>

          {user ? (
            <button onClick={handleLogout}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
              {isBn ? 'লগআউট' : 'Logout'}
            </button>
          ) : (
            <Link href={`/${locale}/login`}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-black hover:opacity-90 transition-all"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
              {isBn ? 'লগইন' : 'Login'}
            </Link>
          )}

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-8 h-8 flex flex-col justify-center items-center gap-1.5">
            <span className={`block w-5 h-0.5 bg-gray-900 dark:bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-900 dark:bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-900 dark:bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#030712] px-4 py-4 space-y-1">
          {[...scienceSubjects, ...otherSubjects].map(s => (
            <Link key={s.slug} href={`/${locale}/subjects/${s.slug}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
              <span>{s.icon}</span>
              <span>{isBn ? s.bn : s.en}</span>
            </Link>
          ))}
          <Link href={`/${locale}/graph`} onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
            📊 {isBn ? 'গ্রাফ' : 'Graph'}
          </Link>
          {isAdmin && (
            <Link href={`/${locale}/admin`} onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-sm">
              ⚙️ {isBn ? 'অ্যাডমিন' : 'Admin'}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
