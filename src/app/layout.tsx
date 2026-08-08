import type { Metadata } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  metadataBase: new URL("https://nurlingo.app"),
  title: "NUR Lingo — Հայկական AI Լեզվի Հարթակ",
  description: "AI-native Armenian ↔ English language learning. Semantic understanding, HAYQ tokens, Նուռ mascot.",
  keywords: ["Armenian","հայերեն","language learning","AI","HAYQ","NLP","Armenia"],
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
  openGraph: {
    title: "NUR Lingo",
    description: "Սովորիր հայերեն AI-ի հետ — semantic understanding, HAYQ reward system",
    images: ["/logo.svg"],
    locale: "hy_AM",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Armenian:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-mono antialiased">
        {/* Fixed background */}
        <div 
          className="fixed inset-0 -z-10 pointer-events-none"
          style={{
            backgroundImage: "url('/images/pomegranate-bg.jpg')",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
          }}
        />
        <div className="fixed inset-0 -z-10 bg-black/70 pointer-events-none" />
        
        {/* Main container for centering */}
        <div className="container-main">
          <ServiceWorkerRegister />
          {children}
        </div>
      </body>
    </html>
  );
}