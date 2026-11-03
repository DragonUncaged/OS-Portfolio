import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { profile, site } from "@/data/portfolio";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: { canonical: "/" },
  title: site.title,
  description: site.description,
  applicationName: site.shortName,
  authors: [{ name: profile.name }],
  creator: profile.name,
  keywords: [profile.name, profile.handle, profile.role, "portfolio"],
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    siteName: site.shortName,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
