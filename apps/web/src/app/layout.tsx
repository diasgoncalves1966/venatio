import type { Metadata } from 'next';
import { Fraunces, Source_Sans_3 } from 'next/font/google';
import { AuthProvider } from '@/components/auth-provider';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const sans = Source_Sans_3({
  variable: '--font-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Venatio',
  description: 'Marketplace C2C de equipamento de caça em segunda mão',
  icons: {
    icon: [{ url: '/venatio_icon.jpg', type: 'image/jpeg' }],
    apple: [{ url: '/venatio_icon.jpg', type: 'image/jpeg' }],
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt" className={`${display.variable} ${sans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#f7f4ef] font-sans text-stone-900">
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
