import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/analytics";

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
    template: "%s | BPTAP | Ministry of Health Kenya",
    default: "Benefits Package & Tariffs Advisory Panel | Ministry of Health Kenya"
  },
  description: "The official website for the Benefits Package and Tariffs Advisory Panel (BPTAP), under the Ministry of Health Kenya. Promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage.",
  keywords: [
    "health technology assessment", "HTA Kenya", "evidence-based healthcare",
    "universal health coverage", "SHA program", "healthcare policy",
    "benefits package", "healthcare tariffs", "Ministry of Health Kenya",
    "BPTAP", "Kenya health policy"
  ],
  authors: [{ name: "Benefits Package and Tariffs Advisory Panel" }],
  creator: "CEMA",
  publisher: "Ministry of Health Kenya",

  metadataBase: new URL("https://bptap.health.go.ke"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    title: "BPTAP | Ministry of Health Kenya",
    description: "The official website for the Benefits Package and Tariffs Advisory Panel, under the Ministry of Health Kenya.",
    url: "https://bptap.health.go.ke",
    siteName: "BPTAP – Ministry of Health Kenya",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Benefits Package and Tariffs Advisory Panel – Ministry of Health Kenya",
      },
    ],
    locale: "en_KE",   
  },

  twitter: {
    card: "summary_large_image",
    title: "BPTAP | Ministry of Health Kenya",
    description: "Promoting transparent, evidence-informed healthcare decision-making and universal health coverage in Kenya.",
    images: ["/twitter-image.jpg"],
  },
  verification: {
    google: "D0TeHRYuJqPMFxLbOlh6kR6MAkSElpgiXE6GOv_yARw",
  },
  category: "Healthcare",
};

{/* <meta name="google-site-verification" content="D0TeHRYuJqPMFxLbOlh6kR6MAkSElpgiXE6GOv_yARw" /> */}

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
           <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}