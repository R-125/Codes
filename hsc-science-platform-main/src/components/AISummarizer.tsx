'use client';

import { useState } from 'react';

interface Props {
  locale: string;
  contentType: 'pdf' | 'video' | 'image' | 'link';
  contentUrl: string;
  contentTitle: string;
}

type SummaryStatus = 'idle' | 'loading' | 'done' | 'error';

export default function AISummarizer({ locale, contentType, contentUrl, contentTitle }: Props) {
  const isBn = locale === 'bn';
  const [status, setStatus] = useState<SummaryStatus>('idle');
  const [summary, setSummary] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [expanded, setExpanded] = useState(false);

  const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match?.[1] ?? null;
  };

  const callGemini = async (parts: object[], bn: boolean) => {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts }] }),
      }
    );
    if (!res.ok) {
      if (res.status === 429) throw new Error(bn ? 'ফ্রি কোটা শেষ হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।' : 'Free quota exceeded. Please try again later.');
      if (res.status === 403) throw new Error(bn ? 'API key সঠিক নয়।' : 'Invalid API key.');
      throw new Error(bn ? 'সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Something went wrong. Please try again.');
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSummarize = async () => {
    if (!GEMINI_KEY) {
      setSummary(isBn ? 'Gemini API key পাওয়া যায়নি।' : 'Gemini API key not found.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setSummary('');
    setExpanded(true);

    const lang = isBn
      ? 'বাংলায় সহজ ভাষায় সংক্ষিপ্ত সারসংক্ষেপ দাও। HSC বিজ্ঞান শিক্ষার্থীদের জন্য উপযোগী করো।'
      : 'Summarize in simple English for HSC Science students in Bangladesh.';

    try {
      let text = '';

      if (contentType === 'video') {
        const videoId = extractYouTubeId(contentUrl);
        if (!videoId) throw new Error(isBn ? 'সঠিক YouTube URL নয়।' : 'Invalid YouTube URL');
        const prompt = `এই YouTube ভিডিওটির বিষয়বস্তু "${contentTitle}" সম্পর্কে। ভিডিও ID: ${videoId}। ${lang} মূল বিষয়গুলো bullet point আকারে লেখো।`;
        text = await callGemini([{ text: prompt }], isBn);

      } else if (contentType === 'pdf') {
        const prompt = `এই PDF এর শিরোনাম: "${contentTitle}"। URL: ${contentUrl}। ${lang} এটি একটি HSC বিজ্ঞান বিষয়ের নোট বা বই। মূল বিষয়গুলো bullet point আকারে সংক্ষেপ করো।`;
        text = await callGemini([{ text: prompt }], isBn);

      } else if (contentType === 'image') {
        if (imageFile) {
          const base64 = await toBase64(imageFile);
          const mimeType = imageFile.type || 'image/jpeg';
          text = await callGemini([
            { inline_data: { mime_type: mimeType, data: base64 } },
            { text: `এই ছবিতে কী লেখা আছে তা পড়ো এবং ${lang} মূল বিষয়গুলো bullet point আকারে লেখো।` },
          ], isBn);
        } else {
          const prompt = `এই নোট/ছবির শিরোনাম: "${contentTitle}"। ${lang} এটি একটি HSC বিজ্ঞান নোট। মূল ধারণাগুলো সংক্ষেপ করো।`;
          text = await callGemini([{ text: prompt }], isBn);
        }
      }

      setSummary(text);
      setStatus('done');
    } catch (err) {
      setSummary(err instanceof Error ? err.message : (isBn ? 'সমস্যা হয়েছে।' : 'Failed.'));
      setStatus('error');
    }
  };

  const needsImageUpload = contentType === 'image' && !contentUrl.startsWith('http');

  return (
    <div className="mt-3 rounded-xl border border-[#00c896]/20 bg-[#00c896]/5 overflow-hidden">
      <button
        onClick={() => status === 'idle' ? handleSummarize() : setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#00c896]/10 transition-all">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <span className="text-sm font-semibold text-[#00c896]">
            {status === 'idle' && (isBn ? 'AI দিয়ে সারসংক্ষেপ করুন' : 'Summarize with AI')}
            {status === 'loading' && (isBn ? 'AI বিশ্লেষণ করছে...' : 'AI is analyzing...')}
            {status === 'done' && (isBn ? 'AI সারসংক্ষেপ' : 'AI Summary')}
            {status === 'error' && (isBn ? 'সমস্যা হয়েছে' : 'Error occurred')}
          </span>
          {status === 'loading' && (
            <div className="w-4 h-4 rounded-full border-2 border-[#00c896] border-t-transparent animate-spin" />
          )}
        </div>
        {status !== 'idle' && (
          <span className="text-gray-400 text-xs">{expanded ? '▲' : '▼'}</span>
        )}
      </button>

      {status === 'idle' && needsImageUpload && (
        <div className="px-4 pb-3">
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
            {isBn ? 'নোটের ছবি আপলোড করুন:' : 'Upload note image:'}
          </label>
          <input type="file" accept="image/*"
            onChange={e => setImageFile(e.target.files?.[0] ?? null)}
            className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-[#00c896]/10 file:text-[#00c896] cursor-pointer" />
        </div>
      )}

      {expanded && summary && (
        <div className="px-4 pb-4">
          <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
            status === 'error' ? 'text-red-400' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {summary}
          </div>
          {status === 'done' && (
            <div className="mt-3 flex gap-2">
              <button onClick={handleSummarize}
                className="text-xs text-[#00c896] hover:underline">
                {isBn ? '↺ আবার করুন' : '↺ Regenerate'}
              </button>
              <button onClick={() => navigator.clipboard.writeText(summary)}
                className="text-xs text-gray-400 hover:text-[#00c896] transition-colors">
                {isBn ? '📋 কপি করুন' : '📋 Copy'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
