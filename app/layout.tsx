import type { Metadata } from "next";
import { Anuphan } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const anuphan = Anuphan({ 
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-anuphan",
});

export const metadata: Metadata = {
  title: "Loyalty Point CRM",
  description: "ระบบจัดการแต้มสะสมและแลกรางวัล",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={anuphan.variable}>
      <body className={anuphan.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

