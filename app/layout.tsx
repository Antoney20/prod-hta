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
    template: "%s | Health Benefits and Tariffs Advisory Panel| The University of Nairobi",
    default: "Health Benefits and Tariffs Advisory Panel| Advancing Evidence-Based Healthcare | The University of Nairobi"
  },
  description: "The official website for Health Benefits and Tariffs Advisory Panel, promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage.",
  keywords: ["health technology assessment", "HTA Kenya", "evidence-based healthcare", "universal health coverage", "SHA program", "healthcare policy", "benefits package", "healthcare tariffs"],
  authors: [{ name: "Health Technology Assessment Panel" }],
  creator: "CEMA",
  publisher: "CEMA",
  metadataBase: new URL("https://hta-chi.vercel.app"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "Health Benefits and Tariffs Advisory Panel| Advancing Evidence-Based Healthcare",
    description: "The official website for Health Benefits and Tariffs Advisory Panel, promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage.",
    url: "https://hta-chi.vercel.app",
    siteName: "Health Benefits and Tariffs Advisory Panel",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Health Benefits and Tariffs Advisory Panel",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health Benefits and Tariffs Advisory Panel",
    description: "Promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage.",
    images: ["/twitter-image.jpg"],
  },
  verification: {
   
  },
  category: "Healthcare",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}