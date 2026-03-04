'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import supabase from '@/lib/supabase';
import { getSubjectColor } from '@/lib/subjects';
import VideoEmbed from '@/components/VideoEmbed';
import PDFViewer from '@/components/PDFViewer';
import UploadModal from '@/components/UploadModal';
import AISummarizer from '@/components/AISummarizer';
import type { Subject, Content } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SubjectPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const slug = params?.slug as string;
  const isBn = locale === 'bn';

  const [subject, setSubject] = useState<Subject | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: sub }, { data: { user: u } }] = await Promise.all([
      supabase.from('subjects').select('*').eq('slug', slug).single(),
      supabase.auth.getUser(),
    ]);
    setSubject(sub);
    setUser(u);
    if (u) {
      const { data: profile } = await supabase.from('profiles').select('role,approved').eq('id', u.id).single();
      if (profile) { setUserRole(profile.role); setIsApproved(profile.approved); }
    }
    if (sub) {
      const { data: c } = await supabase.from('content').select('*').eq('subject_id', sub.id).order('created_at', { ascending: false });
      setContents(c ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [slug]);

  const handleDelete = async (id: string) => {
    if (!confirm(isBn ? 'মুছে ফেলবেন?' : 'Delete this content?')) return;
    await supabase.from('content').delete().eq('id', id);
    setContents(prev => prev.filter(c => c.id !== id));
  };

  const canUpload = user && (userRole === 'admin' || (userRole === 'contributor' && isApproved));
  const { color, border, accent } = getSubjectColor(slug);

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 px-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (!subject) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {isBn ? 'বিষয় পাওয়া যায়নি' : 'Subject not found'}
          </h1>
          <Link href={`/${locale}`} className="text-[#00c896] hover:underline">
            {isBn ? '← হোমপেজে ফিরুন' : '← Back to home'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className={`p-6 rounded-2xl border ${border} bg-gradient-to-br ${color} mb-8`}>
          <Link href={`/${locale}`} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4 inline-block transition-colors">
            {isBn ? '← হোমপেজ' : '← Home'}
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-5xl mb-3">{subject.icon ?? '📚'}</div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                {isBn ? subject.name_bn : subject.name_en}
              </h1>
              <p className="text-sm mt-1" style={{ color: accent }}>
                {isBn ? `${subject.part} নং পত্র` : `Part ${subject.part}`} • {
                  ['bangla-1','bangla-2','english-1','english-2'].includes(subject.slug)
                    ? (isBn ? 'ভাষা' : 'Language')
                    : subject.section === 'technology'
                    ? (isBn ? 'প্রযুক্তি' : 'Technology')
                    : (isBn ? 'বিজ্ঞান' : 'Science')
                }
              </p>
            </div>
            {canUpload && (
              <button onClick={() => setShowUpload(true)}
                className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
                {isBn ? '+ আপলোড' : '+ Upload'}
              </button>
            )}
          </div>
        </div>

        {contents.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400">
              {isBn ? 'এখনো কোনো কন্টেন্ট নেই।' : 'No content available yet.'}
            </p>
            {canUpload && (
              <button onClick={() => setShowUpload(true)}
                className="mt-4 px-6 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 transition-all"
                style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
                {isBn ? 'প্রথম কন্টেন্ট যোগ করুন' : 'Add first content'}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {contents.map(content => (
              <div key={content.id} className="p-5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        content.type === 'pdf' ? 'bg-red-500/10 text-red-400' :
                        content.type === 'video' ? 'bg-blue-500/10 text-blue-400' :
                        content.type === 'image' ? 'bg-green-500/10 text-green-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {content.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {isBn ? content.title_bn : content.title_en}
                    </h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {(userRole === 'admin' || content.uploaded_by === user?.id) && (
                      <button onClick={() => handleDelete(content.id)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                        {isBn ? 'মুছুন' : 'Delete'}
                      </button>
                    )}
                    <a href={content.url} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20 transition-all">
                      {isBn ? 'খুলুন ↗' : 'Open ↗'}
                    </a>
                  </div>
                </div>

                {content.type === 'video' && (
                  <VideoEmbed url={content.url} embedCode={content.embed_code} title={isBn ? content.title_bn : content.title_en} />
                )}
                {content.type === 'pdf' && (
                  <PDFViewer url={content.url} title={isBn ? content.title_bn : content.title_en} />
                )}
                {content.type === 'image' && (
                  <img
                    src={content.url} alt={isBn ? content.title_bn : content.title_en}
                    loading="lazy"
                    onClick={() => setLightbox(content.url)}
                    className="w-full rounded-xl max-h-96 object-contain cursor-zoom-in bg-gray-100 dark:bg-white/5"
                  />
                )}

                <AISummarizer
                  locale={locale}
                  contentType={content.type}
                  contentUrl={content.url}
                  contentTitle={isBn ? content.title_bn : content.title_en}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {showUpload && subject && (
        <UploadModal
          subjectId={subject.id}
          locale={locale}
          onClose={() => setShowUpload(false)}
          onSuccess={fetchData}
        />
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain rounded-xl" />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300">✕</button>
        </div>
      )}
    </main>
  );
}
