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
  metadataBase: new URL("https://werkkeur.nl"),
  title: {
    default: "WerkKeur | Documentbeheer voor onderaannemers",
    template: "%s | WerkKeur",
  },
  description:
    "Beheer VCA's, verzekeringen, KvK-documenten en andere documenten van onderaannemers op één plek. WerkKeur bewaakt automatisch ontbrekende en verlopen documenten.",
  openGraph: {
    title: "WerkKeur | Documentbeheer voor onderaannemers",
    description:
      "Iedere onderaannemer. Altijd op orde. WerkKeur bewaakt documenten en vervaldatums automatisch.",
    url: "https://werkkeur.nl",
    siteName: "WerkKeur",
    locale: "nl_NL",
    type: "website",
  },
  alternates: {
    canonical: "https://werkkeur.nl",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
