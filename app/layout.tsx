import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { PhysioProvider } from '../context/PhysioContext';
import { ThemeProvider, LanguageProvider } from '../context/ThemeLanguageContext';
import AppWrapper from '../components/AppWrapper';

export const metadata: Metadata = {
  title: 'ClinicalIQ',
  description: 'Your daily MBBS, BPT, and Nursing medical revision companion. Master high-yield medical flashcards and anatomy in 5 minutes every day. Learn. Recall. Perform.',
  openGraph: {
    title: 'ClinicalIQ',
    description: 'Your daily MBBS, BPT, and Nursing medical revision companion. Master high-yield medical flashcards and anatomy in 5 minutes every day. Learn. Recall. Perform.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicalIQ',
    description: 'Your daily MBBS, BPT, and Nursing medical revision companion. Master high-yield medical flashcards and anatomy in 5 minutes every day. Learn. Recall. Perform.',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark bg-slate-950">
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 antialiased transition-colors duration-300 min-h-[100dvh] overflow-x-hidden">
        <LanguageProvider>
          <ThemeProvider>
            <PhysioProvider>
              <AppWrapper>
                {children}
              </AppWrapper>
            </PhysioProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
