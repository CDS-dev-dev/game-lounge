import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "ゲームラウンジ",
  description: "大人のためのオンラインボードゲームプラットフォーム。ガイスター、中国象棋、立体四目並べを無料でプレイ。",
  keywords: ["ボードゲーム", "オンライン対戦", "ガイスター", "中国象棋", "立体四目並べ", "無料ゲーム"],
  authors: [{ name: "ゲームラウンジ" }],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://game-lounge-pi.vercel.app",
    siteName: "ゲームラウンジ",
    title: "ゲームラウンジ - 大人のためのオンラインボードゲーム",
    description: "ガイスター、中国象棋、立体四目並べを無料でプレイ。オンライン対戦・ローカル対戦・CPU対戦に対応。",
    images: [
      {
        url: "https://game-lounge-pi.vercel.app/icon-512.png",
        width: 512,
        height: 512,
        alt: "ゲームラウンジ",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "ゲームラウンジ",
    description: "大人のためのオンラインボードゲームプラットフォーム",
    images: ["https://game-lounge-pi.vercel.app/icon-512.png"],
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ゲームラウンジ',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
