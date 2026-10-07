import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'İnovasyonun İzinde: Fikirden Devrime | Teknoloji ve Tasarım',
  description: 'Teknoloji ve Tasarım dersi için tarihî inovasyon belgelerini inceleyen Tekno Muhabir, 1919 esintili dijital gazete ve sesli podcast hazırlama platformu.',
  openGraph: {
    title: 'İnovasyonun İzinde: Fikirden Devrime | Teknoloji ve Tasarım',
    description: 'Teknoloji ve Tasarım dersi için tarihî inovasyon belgelerini inceleyen Tekno Muhabir, 1919 esintili dijital gazete ve sesli podcast hazırlama platformu.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'İnovasyonun İzinde: Fikirden Devrime | Teknoloji ve Tasarım',
    description: 'Teknoloji ve Tasarım dersi için tarihî inovasyon belgelerini inceleyen Tekno Muhabir, 1919 esintili dijital gazete ve sesli podcast hazırlama platformu.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="tr">
      <body suppressHydrationWarning className="min-h-screen bg-[#faf8f3] text-stone-900 antialiased selection:bg-amber-800 selection:text-white">
        {children}
      </body>
    </html>
  );
}
