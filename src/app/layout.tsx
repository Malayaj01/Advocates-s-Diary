import type { Metadata, Viewport } from "next";
import { Martel, Mukta } from "next/font/google";
import { getLang } from "@/i18n/server";
import "./globals.css";

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "700"],
  variable: "--font-mukta",
});

const martel = Martel({
  subsets: ["latin", "devanagari"],
  weight: ["700", "800"],
  variable: "--font-martel",
});

export const metadata: Metadata = {
  title: "Advocate's Diary",
  description: "Cases, hearing dates and fees — in one diary.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Diary", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#f6f0e4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body className={`${mukta.variable} ${martel.variable} antialiased`}>{children}</body>
    </html>
  );
}
