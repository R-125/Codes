'use client';

import { useState } from 'react';
import supabase from '@/lib/supabase';

type UploadType = 'pdf-link' | 'pdf-upload' | 'video' | 'image-link' | 'image-upload';

interface Props {
  subjectId: string;
  locale: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ subjectId, locale, onClose, onSuccess }: Props) {
  const isBn = locale === 'bn';
  const [type, setType] = useState<UploadType>('pdf-link');
  const [titleEn, setTitleEn] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const typeOptions: { value: UploadType; icon: string; en: string; bn: string }[] = [
    { value: 'pdf-link',     icon: '🔗', en: 'PDF Link',     bn: 'পিডিএফ লিংক' },
    { value: 'pdf-upload',   icon: '📄', en: 'PDF Upload',   bn: 'পিডিএফ আপলোড' },
    { value: 'video',        icon: '▶️',  en: 'Video URL',    bn: 'ভিডিও URL' },
    { value: 'image-link',   icon: '🖼️', en: 'Image Link',   bn: 'ছবির লিংক' },
    { value: 'image-upload', icon: '📷', en: 'Image Upload', bn: 'ছবি আপলোড' },
  ];

  const handleSubmit = async () => {
    if (!titleEn || !titleBn) {
      setMessage({ type: 'error', text: isBn ? 'দুটি ভাষায় শিরোনাম দিন।' : 'Please fill titles in both languages.' });
      return;
    }
    setLoading(true); setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      let finalUrl = url;
      let contentType: 'pdf' | 'video' | 'image' | 'link' = 'link';
      let isExternal = true;

      if (type === 'pdf-upload' || type === 'image-upload') {
        if (!file) throw new Error(isBn ? 'ফাইল সিলেক্ট করুন।' : 'No file selected');
        const ext = file.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        setProgress(30);
        const { error: uploadError } = await supabase.storage.from('hsc-content').upload(path, file);
        if (uploadError) throw uploadError;
        setProgress(70);
        const { data: { publicUrl } } = supabase.storage.from('hsc-content').getPublicUrl(path);
        finalUrl = publicUrl;
        isExternal = false;
        contentType = type === 'pdf-upload' ? 'pdf' : 'image';
      } else if (type === 'pdf-link') { contentType = 'pdf'; }
      else if (type === 'video') { contentType = 'video'; }
      else if (type === 'image-link') { contentType = 'image'; }

      setProgress(85);
      const { error } = await supabase.from('content').insert({
        subject_id: subjectId, title_en: titleEn, title_bn: titleBn,
        type: contentType, url: finalUrl, is_external: isExternal, uploaded_by: user.id,
      });
      if (error) throw error;
      setProgress(100);
      setMessage({ type: 'success', text: isBn ? 'সফলভাবে আপলোড হয়েছে!' : 'Uploaded successfully!' });
      setTimeout(() => { onSuccess(); onClose(); }, 1000);
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Upload failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1b2d] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="py-2 text-gray-900 dark:text-white text-sm font-bold rounded-xl px-4 font-size-50px">
            {isBn ? 'কন্টেন্ট আপলোড' : 'Upload Content'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white transition-all flex items-center justify-center">✕</button>
        </div>

        <div className="space-y-4">
          {/* Type selector — button grid instead of select */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white text-sm hover:bg-white/10 transition-all">
              <span className="flex items-center gap-2">
                <span>{typeOptions.find(o => o.value === type)?.icon}</span>
                <span>{isBn ? typeOptions.find(o => o.value === type)?.bn : typeOptions.find(o => o.value === type)?.en}</span>
              </span>
              <span className={`transition-transform duration-200 text-gray-400 ${dropdownOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white dark:bg-[#0f1b2d] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl">
                {typeOptions.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setType(opt.value); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all text-left ${
                      type === opt.value
                        ? 'bg-[#00c896] text-black font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}>
                    <span>{opt.icon}</span>
                    <span>{isBn ? opt.bn : opt.en}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title EN */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              {isBn ? 'শিরোনাম (ইংরেজি)' : 'Title (English)'}
            </label>
            <input type="text" value={titleEn} onChange={e => setTitleEn(e.target.value)}
              placeholder="Chapter 1:"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#00c896] transition-colors text-sm"/>
          </div>

          {/* Title BN */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
              {isBn ? 'শিরোনাম (বাংলা)' : 'Title (Bengali)'}
            </label>
            <input type="text" value={titleBn} onChange={e => setTitleBn(e.target.value)}
              placeholder="অধ্যায় ১:"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#00c896] transition-colors text-sm" />
          </div>

          {/* URL or File */}
          {(type === 'pdf-link' || type === 'video' || type === 'image-link') ? (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">URL</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#00c896] transition-colors text-sm"/>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">
                {isBn ? 'ফাইল' : 'File'}
              </label>
              <input type="file"
                accept={type === 'pdf-upload' ? '.pdf' : 'image/*'}
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00c896]/10 file:text-[#00c896] hover:file:bg-[#00c896]/20 cursor-pointer" />
            </div>
          )}

          {/* Progress */}
          {loading && progress > 0 && (
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-[#00c896] to-[#00a8ff] transition-all duration-300"
                style={{ width: `${progress}%` }} />
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-xl text-sm ${message.type === 'success'
              ? 'bg-[#00c896]/10 text-[#00c896] border border-[#00c896]/20'
              : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
              {loading ? '...' : (isBn ? 'আপলোড করুন' : 'Upload')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
