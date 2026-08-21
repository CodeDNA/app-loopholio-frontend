import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terms of Service Analyzer",
  description:
    "Analyze Terms of Service documents and identify key risks, clauses, and compliance issues",
  generator: "tosgotcha",
  icons: {
    icon: [
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon-dark-32x32.png",
        type: "image/svg+xml",
      },
    ],
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased bg-[#0b0f15]" // from light to dark: #11151c, #0b0f15 #070a0f
        style={{
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Ubuntu", sans-serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
