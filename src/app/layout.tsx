import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TransPic - Fast, Private Image Processing Tools",
  description: "Process your images entirely in your browser - no uploads, no ads, no privacy concerns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
