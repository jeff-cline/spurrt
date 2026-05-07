import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Spurrt — A micro-economy for underutilized talent",
  description:
    "Spurrt turns the underutilized time of high-capacity people and the underutilized resources of organizations into a marketplace where both win.",
  metadataBase: new URL("https://spurrt.com"),
  openGraph: {
    title: "Spurrt",
    description: "A micro-economy where underutilized time meets underutilized opportunity.",
    url: "https://spurrt.com",
    siteName: "Spurrt",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spurrt",
    description: "A micro-economy where underutilized time meets underutilized opportunity.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
