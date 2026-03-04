import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import supabase from '@/lib/supabase';
import SubjectCard from '@/components/SubjectCard';
import type { Subject } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isBn = locale === 'bn';
  return {
    title: isBn ? 'এইচএসসি বিজ্ঞান প্ল্যাটফর্ম' : 'HSC Science Platform',
    description: isBn ? 'এইচএসসি বিজ্ঞান প্ল্যাটফর্ম' : 'HSC Science Platform',
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations();
  const isBn = locale === 'bn';

  const { data: subjects } = await supabase.from('subjects').select('*').order('section').order('part');
  const scienceSubjects = (subjects ?? []).filter((s: Subject) => 
  s.section === 'science' && ['physics-1','physics-2','chemistry-1','chemistry-2','biology-1','biology-2','higher-math-1','higher-math-2'].includes(s.slug)
  );
  const langSubjects = (subjects ?? []).filter((s: Subject) => 
  ['bangla-1','bangla-2','english-1','english-2'].includes(s.slug)
  );
  const techSubjects = (subjects ?? []).filter((s: Subject) => s.section === 'technology');
  return (
    <main className="min-h-screen bg-white dark:bg-[#030712]">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00c896]/5 rounded-full blur-[120px]" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[80px]" />
          <div className="absolute top-10 right-1/4 w-[250px] h-[250px] bg-blue-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(#00c896 1px, transparent 1px), linear-gradient(90deg, #00c896 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00c896]/30 bg-[#00c896]/5 text-[#00c896] text-sm font-medium mb-8 tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00c896] animate-pulse" />
            HSC — বিজ্ঞান বিভাগ
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-10 leading-none">
            <span className="text-gray-900 dark:text-white">{isBn ? 'এইচএসসি ' : 'HSC '}</span>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
              {isBn ? 'বিজ্ঞান' : 'Science'}
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">{isBn ? 'প্ল্যাটফর্ম' : 'Platform'}</span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#subjects"
            className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-black text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#00c896]/40"
            style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
            <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
            <span>{t('homepage.startLearning')}</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">→</span>
          </a>
          </div>
        </div>
      </section>

      {/* Science Subjects */}
      <section className="px-6 pb-12" id="subjects">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isBn ? 'বিজ্ঞান বিষয়সমূহ' : 'Science Subjects'}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#00c896]/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {scienceSubjects.map((subject: Subject) => (
              <SubjectCard key={subject.id} subject={subject} locale={locale} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Language Section */}
<section className="px-6 pb-12">
  <div className="max-w-6xl mx-auto">
    <div className="flex items-center gap-4 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {isBn ? 'ভাষা বিষয়সমূহ' : 'Language Subjects'}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[#00c896]/30 to-transparent" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {langSubjects.map((subject: Subject) => (
        <SubjectCard key={subject.id} subject={subject} locale={locale} />
      ))}
    </div>
  </div>
</section>

      {/* Technology Section */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isBn ? 'প্রযুক্তি বিষয়সমূহ' : 'Technology Subjects'}
            </h2>
            <div className="flex-1 h-px bg-gradient-to-r from-[#00c896]/30 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {techSubjects.map((subject: Subject) => (
              <SubjectCard key={subject.id} subject={subject} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
