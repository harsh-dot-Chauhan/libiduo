import type { Metadata } from "next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import Providers from "@/components/layout/Providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://libiduo.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Libiduo — Shop Online",
    template: "%s | Libiduo",
  },
  description: "Fast, mobile-friendly online store. Browse our curated collection and enjoy cash-on-delivery across India.",
  keywords: ["online shopping", "india", "cash on delivery", "libiduo"],
  authors: [{ name: "Libiduo" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Libiduo",
    title: "Libiduo — Shop Online",
    description: "Fast, mobile-friendly online store with cash-on-delivery across India.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Libiduo — Shop Online",
    description: "Fast, mobile-friendly online store with cash-on-delivery across India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
