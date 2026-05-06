import "./globals.css";

export const metadata = {
  title: "Spurrt",
  description: "A micro-economy for underutilized talent and opportunity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
