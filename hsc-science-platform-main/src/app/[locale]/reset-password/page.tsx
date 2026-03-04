'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'bn';
  const isBn = locale === 'bn';
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase automatically handles the token from URL hash
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
  }, []);

  const handleReset = async () => {
    if (password !== confirm) {
      setMessage({ type: 'error', text: isBn ? 'পাসওয়ার্ড মিলছে না।' : 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।' : 'Password must be at least 6 characters.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!' : 'Password updated successfully!' });
      setTimeout(() => router.push(`/${locale}/login`), 2000);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#00c896]/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>Σ</div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">
              {isBn ? 'এইচএসসি বিজ্ঞান' : 'HSC Science'}
            </span>
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {isBn ? 'নতুন পাসওয়ার্ড দিন' : 'Set New Password'}
          </h1>
        </div>

        <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
          {!ready ? (
            <div className="text-center py-4">
              <div className="w-8 h-8 rounded-full border-2 border-[#00c896] border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying link...'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#00c896] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                </label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-[#00c896] transition-colors" />
              </div>

              {message && (
                <div className={`px-4 py-3 rounded-xl text-sm ${
                  message.type === 'success'
                    ? 'bg-[#00c896]/10 text-[#00c896] border border-[#00c896]/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message.text}
                </div>
              )}

              <button onClick={handleReset} disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
                {loading ? '...' : (isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password')}
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href={`/${locale}/login`} className="text-sm text-[#00c896] hover:underline">
              {isBn ? '← লগইনে ফিরুন' : '← Back to login'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
