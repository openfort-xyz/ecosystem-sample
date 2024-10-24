import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppWrapper from './utils/wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ecosystem Wallet Connect Examples',
  description: 'Examples of how to connect wallets to Ecosystem Wallet with NextJS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppWrapper>
        {children}
        </AppWrapper>
      </body>
    </html>
  );
}
