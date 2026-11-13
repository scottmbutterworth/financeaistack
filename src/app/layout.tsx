import { PageviewBeacon } from "@/components/pageview";
import { SignupForm } from "@/components/signup-form";
import { JsonLd, siteGraph } from "@/components/structured";
import { SponsorSlot } from "@/components/sponsor-slot";
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from "@/lib/site";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE_NAME} — AI tools for CFOs`, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <Suspense fallback={null}>
          <SponsorSlot />
        </Suspense>
        <header className="header">
          <Link className="brand" href="/">
            <span className="mark">Finance AI Stack</span>
            <small>For CFOs and finance teams</small>
          </Link>
          <nav className="nav" aria-label="Site">
            <Link href="/workflows">Workflows</Link>
            <Link href="/skills">Skills</Link>
            <Link href="/news">News</Link>
            <Link href="/search" data-desk="true">
              Search
            </Link>
            <Link href="/submit" data-desk="true">
              Submit
            </Link>
            <Link href="/sponsor">Sponsor</Link>
          </nav>
        </header>
        <JsonLd data={siteGraph()} />
        <main id="content">{children}</main>
        <footer className="footer">
          <div className="wrap">
            <div>
              <strong>Weekly note for finance leaders</strong>
              <SignupForm idPrefix="footer" compact />
            </div>
            <p>
              Prices are copied from vendor pages, in USD or AUD where the vendor publishes them, with the source and
              the date checked. If a price is not public, the entry says contact sales.
            </p>
          </div>
        </footer>
        <Suspense fallback={null}>
          <PageviewBeacon />
        </Suspense>
      </body>
    </html>
  );
}
