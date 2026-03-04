'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isBn = locale === 'bn';
  const router = useRouter();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleLogin = async () => {
    setLoading(true); setMessage(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ type: 'error', text: isBn ? 'ইমেইল বা পাসওয়ার্ড ভুল।' : 'Invalid email or password.' });
      setLoading(false); return;
    }
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('approved, role')
        .eq('id', data.user.id)
        .single();

      // যদি profile না পাওয়া যায় তাহলে approved ধরে নেওয়া হবে না
      if (profileError || !profile) {
        await supabase.auth.signOut();
        setMessage({ type: 'warning', text: isBn ? 'প্রোফাইল পাওয়া যায়নি। অ্যাডমিনকে জানান।' : 'Profile not found. Contact admin.' });
        setLoading(false); return;
      }

      if (!profile.approved) {
        await supabase.auth.signOut();
        setMessage({ type: 'warning', text: isBn ? 'আপনার অ্যাকাউন্ট অ্যাডমিন অনুমোদনের অপেক্ষায়।' : 'Your account is pending admin approval.' });
      } else {
        router.push(`/${locale}`);
      }
    }
    setLoading(false);
  };
  const handleSignup = async () => {
    if (!name.trim()) {
      setMessage({ type: 'error', text: isBn ? 'নাম দিন।' : 'Please enter your name.' });
      return;
    }
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } },
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: isBn ? 'অ্যাকাউন্ট তৈরি হয়েছে! অ্যাডমিন অনুমোদনের পরে সম্পূর্ণ অ্যাক্সেস পাবেন।' : 'Account created! You will get full access after admin approval.' });
    }
    setLoading(false);
  };

  const handleForgot = async () => {
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: isBn ? 'রিসেট লিংক পাঠানো হয়েছে! ইমেইল চেক করুন।' : 'Reset link sent! Check your email.' });
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (mode === 'login') handleLogin();
    else if (mode === 'signup') handleSignup();
    else handleForgot();
  };

  const title = mode === 'login' ? (isBn ? 'লগইন' : 'Sign In') :
    mode === 'signup' ? (isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account') :
    (isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset Password');

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
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{title}</h1>
          {mode === 'signup' && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {isBn ? 'নিবন্ধনের পর Admin অনুমোদন প্রয়োজন হবে।' : 'Admin approval required after registration.'}
            </p>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-2xl p-8">
          <div className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {isBn ? 'পূর্ণ নাম' : 'Full Name'}
                </label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder={isBn ? 'আপনার নাম' : 'Your full name'}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#00c896] transition-colors" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {isBn ? 'ইমেইল ঠিকানা' : 'Email address'}
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#00c896] transition-colors" />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  {mode === 'login' && (
                    <button onClick={() => { setMode('forgot'); setMessage(null); }}
                      className="text-xs text-[#00c896] hover:underline">
                      {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:border-[#00c896] transition-colors" />
              </div>
            )}

            {message && (
              <div className={`px-4 py-3 rounded-xl text-sm ${
                message.type === 'success' ? 'bg-[#00c896]/10 text-[#00c896] border border-[#00c896]/20' :
                message.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {message.text}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>
              {loading ? '...' : title}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {mode === 'login' ? (
              <>{isBn ? 'অ্যাকাউন্ট নেই?' : "Don't have an account?"}{' '}
                <button onClick={() => { setMode('signup'); setMessage(null); }} className="text-[#00c896] hover:underline font-medium">
                  {isBn ? 'নিবন্ধন করুন' : 'Sign up'}
                </button>
              </>
            ) : (
              <>{isBn ? 'অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
                <button onClick={() => { setMode('login'); setMessage(null); }} className="text-[#00c896] hover:underline font-medium">
                  {isBn ? 'লগইন করুন' : 'Back to login'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
