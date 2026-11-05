import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1A120B",
};

export const metadata: Metadata = {
  title: {
    default: "DJOE COFFEE — Point of Sale & Sistem Manajemen HPP",
    template: "%s | DJOE COFFEE POS",
  },
  description:
    "Aplikasi Point of Sale (POS) modern, kalkulasi HPP presisi, manajemen resep menu kedai kopi, dan cetak struk thermal — DJOE COFFEE Kendal.",
  applicationName: "DJOE COFFEE POS",
  authors: [{ name: "DJOE COFFEE Team" }],
  generator: "Next.js",
  keywords: [
    "POS Kopi",
    "Kasir Kedai Kopi",
    "Kalkulator HPP Kopi",
    "DJOE COFFEE",
    "Sistem Kasir",
    "Thermal Struk POS",
  ],
  icons: {
    icon: "/images/Logo/logo.png",
    shortcut: "/images/Logo/logo.png",
    apple: "/images/Logo/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://djoecoffee.com",
    siteName: "DJOE COFFEE",
    title: "DJOE COFFEE — Sistem Kasir POS & HPP Kopi",
    description:
      "Aplikasi Kasir POS Cepat, Hitung HPP Otomatis, dan Laporan Penjualan Kedai Kopi.",
    images: [
      {
        url: "/images/Logo/logo.png",
        width: 512,
        height: 512,
        alt: "DJOE COFFEE POS",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "DJOE COFFEE POS",
    description: "Sistem Point of Sale & Hitung HPP Kopi Presisi",
    images: ["/images/Logo/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DJOE COFFEE POS & HPP",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Aplikasi Kasir Point of Sale dan Perhitungan HPP Kopi Presisi untuk DJOE COFFEE.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IDR",
    },
  };

  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#F8F9FA] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
