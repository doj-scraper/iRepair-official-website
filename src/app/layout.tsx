import type { Metadata } from 'next';
import '@/index.css';
import Providers from './providers';
import { PALETTE_INIT_SCRIPT } from '@/lib/theme';

export const metadata: Metadata = {
  title: 'iRepair Connect',
  description: 'Wholesale phone parts storefront',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Synchronously apply saved palette before first paint to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: PALETTE_INIT_SCRIPT }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
