import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;

export type Profile = {
  id: string;
  username: string | null;
  email: string | null;
  role: 'admin' | 'contributor' | 'viewer';
  approved: boolean;
  created_at: string;
};

export type Subject = {
  id: string;
  name_en: string;
  name_bn: string;
  slug: string;
  section: 'science' | 'language' | 'technology';
  part: number;
  icon: string | null;
};

export type Content = {
  id: string;
  subject_id: string;
  title_en: string;
  title_bn: string;
  type: 'pdf' | 'image' | 'video' | 'link';
  url: string;
  embed_code: string | null;
  is_external: boolean;
  uploaded_by: string;
  created_at: string;
};
