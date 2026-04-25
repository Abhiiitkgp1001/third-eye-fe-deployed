import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/lib/trpc/Provider";
import { ThemeProvider } from "@/lib/theme-provider";
import { ToastProvider } from "@/components/ui";
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
  title: "Third Eye — Custom growth signals in plain English",
  description: "Stop settling for generic firehoses. Get the exact buying signals that match your ICP — from job posts to funding rounds to any custom trigger.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: "Third Eye — Custom growth signals in plain English",
    description: "Stop settling for generic firehoses. Get the exact buying signals that match your ICP — from job posts to funding rounds to any custom trigger.",
    // TODO: Create og-image.png at 1200x630 and place in /public
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Third Eye — Custom growth signals in plain English",
    description: "Stop settling for generic firehoses. Get the exact buying signals that match your ICP — from job posts to funding rounds to any custom trigger.",
    // TODO: Create og-image.png at 1200x630 and place in /public
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider>
            <ToastProvider>
              <TRPCProvider>{children}</TRPCProvider>
            </ToastProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
