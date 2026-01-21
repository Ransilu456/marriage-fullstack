import Script from 'next/script';
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import AuthProvider from "./providers";
import ProfileGuard from "./components/ProfileGuard";
import { NotificationProvider } from "./components/NotificationProvider";
import { MatchProvider } from './components/providers/MatchProvider';

import Navbar from "./components/Navbar";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eternity - Find Your Forever",
  description: "Modern matrimony platform for meaningful connections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="unregister-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('Service worker unregistered:', registration);
                }
              });
            }
          `}
        </Script>
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased selection:bg-saffron-100 selection:text-saffron-900 bg-white`}
      >
        <AuthProvider>
          <NotificationProvider>

            <MatchProvider>
              <ProfileGuard>
                <Navbar />
                <main className="min-h-screen pt-20">
                  {children}
                </main>
              </ProfileGuard>
            </MatchProvider>
          </NotificationProvider>

        </AuthProvider>
      </body>
    </html>
  );
}
