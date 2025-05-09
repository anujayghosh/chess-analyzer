import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chess Analyzer - Stockfish Analysis Tool",
  description: "Analyze your Chess.com games with Stockfish engine. Identify mistakes, blunders, and improve your chess skills.",
  icons: {
    icon: [
      {
        url: '/logo.svg',
        href: '/logo.svg',
      }
    ],
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Script to remove Grammarly attributes that cause hydration mismatches */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'data-gr-ext-installed' || 
                        mutation.attributeName === 'data-new-gr-c-s-check-loaded') {
                      const node = mutation.target;
                      node.removeAttribute('data-gr-ext-installed');
                      node.removeAttribute('data-new-gr-c-s-check-loaded');
                    }
                  });
                });
                
                // Start observing the document body for attribute changes
                document.addEventListener('DOMContentLoaded', () => {
                  observer.observe(document.body, { attributes: true });
                });
              } catch (e) {
                console.error('Extension attribute cleanup failed:', e);
              }
            })();
          `
        }} />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
