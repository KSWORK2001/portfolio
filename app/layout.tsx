import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Karan Shrivastava | AI Engineer",
  description:
    "Portfolio profile for Karan Shrivastava, Machine Learning Engineer and Software Developer."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${sora.variable}`}>{children}</body>
    </html>
  );
}
