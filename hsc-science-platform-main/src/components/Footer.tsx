import Link from 'next/link';

export default function Footer({ locale }: { locale: string }) {
  const isBn = locale === 'bn';

  return (
    <footer className="border-t border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#030712]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #00c896, #00a8ff)' }}>Σ</div>
            <span className="font-black text-gray-900 dark:text-white">
              {isBn ? 'এইচএসসি বিজ্ঞান' : 'HSC Science'}
            </span>
            <span className="ml-2 flex items-center gap-1.5 text-xs text-[#00c896]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00c896] animate-pulse" />
              {isBn ? 'বিনামূল্যে' : 'Free'}
            </span>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { href: `/${locale}/subjects/physics-1`,    en: 'Physics I',     bn: 'পদার্থবিজ্ঞান ১' },
              { href: `/${locale}/subjects/chemistry-1`,  en: 'Chemistry I',   bn: 'রসায়ন ১' },
              { href: `/${locale}/subjects/biology-1`,    en: 'Biology I',     bn: 'জীববিজ্ঞান ১' },
              { href: `/${locale}/subjects/higher-math-1`,en: 'Higher Math I', bn: 'উচ্চতর গণিত ১' },
              { href: `/${locale}/subjects/ict`,          en: 'ICT',           bn: 'তথ্য প্রযুক্তি' },
              { href: `/${locale}/subjects/bangla-1`,     en: 'Bangla I',      bn: 'বাংলা ১' },
              { href: `/${locale}/subjects/english-1`,    en: 'English I',     bn: 'ইংরেজি ১' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#00c896] transition-colors">
                {isBn ? l.bn : l.en}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500" style={{ fontSize: '1rem'}}>
            © {new Date().getFullYear()} {isBn ? 'এইচএসসি বিজ্ঞান প্ল্যাটফর্ম' : 'HSC Science Platform'}
          </p>
        </div>
      </div>
    </footer>
  );
}
