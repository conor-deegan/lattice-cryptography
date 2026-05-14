import "./globals.css";
// import { Analytics } from "@vercel/analytics/react";
import { baseUrl } from "./sitemap";
// import Footer from "./components/footer";
import { Crimson_Pro, JetBrains_Mono } from "next/font/google";
import type { Metadata } from "next";
import { ThemeProvider } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
// import { Navbar } from './components/nav';
// import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Lattice Cryptography for Applied Cryptography",
    template: "%s | Lattice Cryptography",
  },
  description: "Learning Lattice Cryptography",
  openGraph: {
    title: "Lattice Cryptography for Applied Cryptography",
    description: "Learning Lattice Cryptography",
    url: baseUrl,
    siteName: "Lattice Cryptography for Applied Cryptography",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const crimsonPro = Crimson_Pro({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${crimsonPro.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="fixed top-3 right-3 z-50">
            <ModeToggle />
          </div>
          {children}
        </ThemeProvider>
        {/*<Analytics />*/}
        {/*<SpeedInsights />*/}
      </body>
    </html>
  );
}
