'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export default function AdminPanel({ locale }: { locale: string }) {
  const isBn = locale === 'bn';
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const toggleApproved = async (id: string, current: boolean) => {
    await supabase.from('profiles').update({ approved: !current }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, approved: !current } : p));
  };

  const changeRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id);
    setProfiles(prev => prev.map(p => p.id === id ? { ...p, role: role as Profile['role'] } : p));
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
            <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold">
              {isBn ? 'ইমেইল' : 'Email'}
            </th>
            <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold">
              {isBn ? 'ভূমিকা' : 'Role'}
            </th>
            <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold">
              {isBn ? 'অনুমোদন' : 'Approved'}
            </th>
            <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400 font-semibold">
              {isBn ? 'কার্যক্রম' : 'Actions'}
            </th>
          </tr>
        </thead>
        <tbody>
          {profiles.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center px-4 py-8 text-gray-500 dark:text-gray-400">
                {isBn ? 'কোনো ব্যবহারকারী নেই।' : 'No users found.'}
              </td>
            </tr>
          ) : profiles.map(p => (
            <tr key={p.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-gray-900 dark:text-white">{p.email ?? '—'}</td>
              <td className="px-4 py-3">
                <select
                  value={p.role}
                  onChange={e => changeRole(p.id, e.target.value)}
                  className="px-2 py-1 rounded-lg text-xs border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 focus:outline-none"
                >
                  <option value="viewer">{isBn ? 'দর্শক' : 'Viewer'}</option>
                  <option value="contributor">{isBn ? 'অবদানকারী' : 'Contributor'}</option>
                  <option value="admin">{isBn ? 'অ্যাডমিন' : 'Admin'}</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.approved
                  ? 'bg-[#00c896]/10 text-[#00c896]'
                  : 'bg-red-500/10 text-red-400'}`}>
                  {p.approved ? (isBn ? 'হ্যাঁ' : 'Yes') : (isBn ? 'না' : 'No')}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => toggleApproved(p.id, p.approved)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${p.approved
                    ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'bg-[#00c896]/10 text-[#00c896] hover:bg-[#00c896]/20'}`}>
                  {p.approved ? (isBn ? 'বাতিল' : 'Revoke') : (isBn ? 'অনুমোদন' : 'Approve')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
