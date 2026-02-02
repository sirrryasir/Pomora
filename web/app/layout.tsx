import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Pomora - Premium Pomodoro Timer for Deep Focus",
    template: "%s | Pomora"
  },
  description: "Pomora is a beautiful, distraction-free Pomodoro timer designed to help you achieve deep focus and maximize productivity. Track your sessions, take smart breaks, and build better work habits.",
  keywords: [
    "pomodoro timer",
    "focus timer",
    "productivity app",
    "time management",
    "deep work",
    "focus sessions",
    "break timer",
    "work timer",
    "study timer",
    "concentration tool",
    "pomora",
    "pomodoro technique"
  ],
  authors: [{ name: "Yasir" }],
  creator: "Yasir",
  publisher: "Yasir",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pomora.yaasir.dev'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Pomora - Premium Pomodoro Timer for Deep Focus",
    description: "Beautiful, distraction-free Pomodoro timer to help you achieve deep focus and maximize productivity.",
    url: 'https://pomora.yaasir.dev',
    siteName: 'Pomora',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pomora - Premium Pomodoro Timer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Pomora - Premium Pomodoro Timer for Deep Focus",
    description: "Beautiful, distraction-free Pomodoro timer to help you achieve deep focus and maximize productivity.",
    images: ['/og-image.png'],
    creator: '@pomora',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/images/favicon-16x16.png',
    apple: '/images/favicon-32x32.png',
  },
  manifest: '/site.webmanifest',
  category: 'productivity',
};

import { ThemeProvider } from "@/components/theme-provider";
import { SettingsProvider } from "@/components/SettingsContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-500`}
      >
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
