export const SUBJECT_COLORS: Record<string, { color: string; border: string; accent: string }> = {
  'physics-1':    { color: 'from-cyan-500/20 to-blue-600/20',    border: 'border-cyan-500/30',    accent: '#06b6d4' },
  'physics-2':    { color: 'from-cyan-500/20 to-blue-600/20',    border: 'border-cyan-500/30',    accent: '#06b6d4' },
  'chemistry-1':  { color: 'from-emerald-500/20 to-green-600/20',border: 'border-emerald-500/30', accent: '#10b981' },
  'chemistry-2':  { color: 'from-emerald-500/20 to-green-600/20',border: 'border-emerald-500/30', accent: '#10b981' },
  'biology-1':    { color: 'from-rose-500/20 to-pink-600/20',    border: 'border-rose-500/30',    accent: '#f43f5e' },
  'biology-2':    { color: 'from-rose-500/20 to-pink-600/20',    border: 'border-rose-500/30',    accent: '#f43f5e' },
  'higher-math-1':{ color: 'from-sky-500/20 to-indigo-600/20',   border: 'border-sky-500/30',     accent: '#0ea5e9' },
  'higher-math-2':{ color: 'from-sky-500/20 to-indigo-600/20',   border: 'border-sky-500/30',     accent: '#0ea5e9' },
  'bangla-1':     { color: 'from-orange-500/20 to-red-600/20',   border: 'border-orange-500/30',  accent: '#f97316' },
  'bangla-2':     { color: 'from-orange-500/20 to-red-600/20',   border: 'border-orange-500/30',  accent: '#f97316' },
  'english-1':    { color: 'from-violet-500/20 to-purple-600/20',border: 'border-violet-500/30',  accent: '#8b5cf6' },
  'english-2':    { color: 'from-violet-500/20 to-purple-600/20',border: 'border-violet-500/30',  accent: '#8b5cf6' },
  'ict':          { color: 'from-amber-500/20 to-orange-600/20', border: 'border-amber-500/30',   accent: '#f59e0b' },
};

export function getSubjectColor(slug: string) {
  return SUBJECT_COLORS[slug] ?? { color: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/30', accent: '#6b7280' };
}

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
