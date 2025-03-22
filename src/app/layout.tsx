import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css"; // Fix the import path
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

// Add cache configuration
export const revalidate = 3600; // Revalidate every hour

// Add dynamic configuration
export const dynamic = 'force-dynamic';

// Define metadata for the application
export const metadata: Metadata = {
  title: "InfluencerIQ - Influencer Analysis & Credibility Assessment",
  description: "AI-powered analytics and credibility assessment for social media influencers",
  icons: {
    // Multiple favicon sizes from CDN for different devices
    icon: [
      { url: "https://static.vecteezy.com/system/resources/previews/010/872/278/non_2x/3d-social-media-influencer-icon-png.png", sizes: "any" },
      { url: "https://static.vecteezy.com/system/resources/previews/010/872/278/non_2x/3d-social-media-influencer-icon-png.png", sizes: "16x16", type: "image/png" },
      { url: "https://static.vecteezy.com/system/resources/previews/010/872/278/non_2x/3d-social-media-influencer-icon-png.png", sizes: "32x32", type: "image/png" },
      { url: "https://static.vecteezy.com/system/resources/previews/010/872/278/non_2x/3d-social-media-influencer-icon-png.png", sizes: "192x192", type: "image/png" },
      { url: "https://static.vecteezy.com/system/resources/previews/010/872/278/non_2x/3d-social-media-influencer-icon-png.png", sizes: "512x512", type: "image/png" },
    ],
    // Apple Touch Icon for iOS devices
    apple: [{ url: "https://static.vecteezy.com/system/resources/previews/010/872/278/non_2x/3d-social-media-influencer-icon-png.png", sizes: "180x180" }],
  },
  // PWA web manifest - also from CDN
  manifest: "https://cdn.jsdelivr.net/gh/influenceriq/brand-assets@main/site.webmanifest",
  // Theme color for browser chrome
  themeColor: "#3B82F6",
  // Other Open Graph metadata for social sharing
  openGraph: {
    type: "website",
    title: "InfluencerIQ - AI-Powered Influencer Analysis",
    description: "Analyze influencer credibility and audience authenticity with AI",
    siteName: "InfluencerIQ",
    images: [{ url: "https://cdn.jsdelivr.net/gh/influenceriq/brand-assets@main/og-image.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add preconnect for performance */}
        <link rel="preconnect" href="https://fa-cdn.fontawesome.com" />
        {/* Add explicit favicon links to ensure they work in all browsers */}
        <link rel="icon" href="https://fa-cdn.fontawesome.com/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://fa-cdn.fontawesome.com/icons/32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://fa-cdn.fontawesome.com/icons/16.png" />
        <link rel="apple-touch-icon" href="https://fa-cdn.fontawesome.com/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <Navbar />
        {/* Add Suspense boundary for better loading states */}
        <Suspense fallback={<div>Loading...</div>}>
          <main className="min-h-screen bg-gray-50 pt-6">{children}</main>
        </Suspense>
      </body>
    </html>
  );
}
