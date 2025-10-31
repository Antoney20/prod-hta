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
    template: "%s | The Benefits Package and Tariffs Advisory Panel | The University of Nairobi",
    default: "The Benefits Package and Tariffs Advisory Panel | Advancing Evidence-Based Healthcare | The University of Nairobi"
  },
  description: "The official website for The Benefits Package and Tariffs Advisory Panel , promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage in Kenya.",
  keywords: ["health technology assessment", "HTA Kenya", "evidence-based healthcare", "universal health coverage", "SHA program", "healthcare policy", "benefits package", "healthcare tariffs"],
  authors: [{ name: "Health Technology Assessment Panel" }],
  creator: "CEMA",
  publisher: "CEMA",
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
    title: "The Benefits Package and Tariffs Advisory Panel | Advancing Evidence-Based Healthcare",
    description: "The official website for The Benefits Package and Tariffs Advisory Panel , promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage.",
    url: "https://bptap.health.go.ke",
    siteName: "The Benefits Package and Tariffs Advisory Panel ",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Benefits Package and Tariffs Advisory Panel ",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Benefits Package and Tariffs Advisory Panel ",
    description: "Promoting transparent, evidence-informed approaches to healthcare decision-making and universal health coverage.",
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