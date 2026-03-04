'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import supabase from '@/lib/supabase';
import AdminPanel from '@/components/AdminPanel';
import type { User } from '@supabase/supabase-js';

export default function AdminPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const isBn = locale === 'bn';
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }: { data: { user: User | null } }) => {
      if (!data.user) { router.push(`/${locale}/login`); return; }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      if (profile?.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
  }, [locale, router]);

  if (isAdmin === null) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#00c896] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {isBn ? 'অ্যাক্সেস অনুমোদিত নয়' : 'Access Denied'}
          </h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00c896]/30 bg-[#00c896]/5 text-[#00c896] text-xs font-medium mb-4 tracking-wider uppercase">
            {isBn ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            {isBn ? 'ব্যবহারকারী ব্যবস্থাপনা' : 'User Management'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {isBn
              ? 'ব্যবহারকারীদের অনুমোদন দিন, ভূমিকা পরিবর্তন করুন।'
              : 'Approve users and manage their roles.'}
          </p>
        </div>
        <AdminPanel locale={locale} />
      </div>
    </main>
  );
}
