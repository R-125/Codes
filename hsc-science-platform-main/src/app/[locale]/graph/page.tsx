import type { Metadata } from 'next';
import GraphPlotter from '@/components/GraphPlotter';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isBn = locale === 'bn';
  return {
    title: isBn ? 'গ্রাফ প্লটার — এইচএসসি বিজ্ঞান' : 'Graph Plotter — HSC Science',
    description: isBn ? 'গাণিতিক সমীকরণ তাৎক্ষণিকভাবে গ্রাফ করুন।' : 'Plot mathematical equations instantly.',
  };
}

export default async function GraphPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isBn = locale === 'bn';

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00c896]/30 bg-[#00c896]/5 text-[#00c896] text-xs font-medium mb-4 tracking-wider uppercase">
            {isBn ? 'গাণিতিক গ্রাফ' : 'Math Graph'}
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
            {isBn ? 'গ্রাফ প্লটার' : 'Graph Plotter'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isBn
              ? 'কার্তেসীয় ও পোলার সমীকরণ তাৎক্ষণিকভাবে প্লট করুন।'
              : 'Instantly plot cartesian and polar equations. Add multiple equations with different colors.'}
          </p>
        </div>
        <GraphPlotter locale={locale} />
      </div>
    </main>
  );
}
