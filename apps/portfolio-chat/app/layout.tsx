import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./styles.css";
import { TooltipProvider } from "@repo/design-system/components/ui/tooltip";
import { ThemeProvider } from "@repo/design-system/providers/theme";
import type { ReactNode } from "react";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3018");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eric Nichols — Portfolio Chat",
    template: "%s | Eric Nichols",
  },
  description:
    "Chat with an AI assistant to explore Eric Nichols' projects, work experience, and background as a senior frontend engineer in New York.",
  openGraph: {
    title: "Eric Nichols — Portfolio Chat",
    description:
      "Interactive AI portfolio: ask about projects, experience, tech stack, and more.",
    type: "website",
    locale: "en_US",
    siteName: "Eric Nichols",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eric Nichols — Portfolio Chat",
    description:
      "Interactive AI portfolio: ask about projects, experience, tech stack, and more.",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html
    className={`${inter.variable} font-sans antialiased`}
    lang="en"
    suppressHydrationWarning
  >
    <body>
      <ThemeProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
