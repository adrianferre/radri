import "./globals.css";
import "@radri/ui/styles.css";
import { twMerge } from "tailwind-merge";
import type { Metadata } from "next";
import { Inter, Fira_Code as FiraCode } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: true,
});

const fira = FiraCode({
  variable: "--font-fira-code",
  subsets: ["latin"],
  preload: true,
});

export const metadata: Metadata = {
  title: "Radri",
  description:
    "Radri is a group of different projects to improve React development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html
      className={twMerge(
        "w-scree h-screen",
        inter.variable,
        fira.variable,
        inter.className
      )}
      lang="en"
    >
      <body className="h-full w-full max-w-3xl mx-auto my-10 overflow-auto space-y-4">
        {children}
      </body>
    </html>
  );
}
