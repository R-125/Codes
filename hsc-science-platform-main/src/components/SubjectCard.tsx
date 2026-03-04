import Link from 'next/link';
import { getSubjectColor } from '@/lib/subjects';
import type { Subject } from '@/lib/supabase';

interface Props {
  subject: Subject;
  locale: string;
}

export default function SubjectCard({ subject, locale }: Props) {
  const isBn = locale === 'bn';
  const { color, border, accent } = getSubjectColor(subject.slug);

  return (
    <Link
      href={`/${locale}/subjects/${subject.slug}`}
      className={`group relative p-6 rounded-2xl border ${border} bg-gradient-to-br ${color} hover:scale-[1.02] transition-all duration-300`}
    >
      <div className="text-4xl mb-3">{subject.icon || '📚'}</div>
      <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
        {isBn ? subject.name_bn : subject.name_en}
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {isBn ? `${subject.part} নং পত্র` : `Part ${subject.part}`} • {
  ['bangla-1','bangla-2','english-1','english-2'].includes(subject.slug)
    ? (isBn ? 'ভাষা' : 'Language')
    : subject.section === 'technology'
    ? (isBn ? 'প্রযুক্তি' : 'Technology')
    : (isBn ? 'বিজ্ঞান' : 'Science')
}
      </p>
      <span className="text-xs font-semibold group-hover:translate-x-1 transition-transform duration-200 inline-block"
        style={{ color: accent }}>
        {isBn ? 'দেখুন →' : 'Explore →'}
      </span>
    </Link>
  );
}
