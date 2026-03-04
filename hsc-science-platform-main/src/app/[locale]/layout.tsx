import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '../globals.css';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch {
    notFound();
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Navbar locale={locale} />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer locale={locale} />
      </div>
    </NextIntlClientProvider>
  );
}
