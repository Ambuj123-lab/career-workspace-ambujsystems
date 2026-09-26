import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL("https://career-workspace-ambujsystems.vercel.app"),
  title: "CoverCraft AI | Evidence-Grounded AI Career Workspace",
  description:
    "Every claim backed by resume evidence. 5-axis competency radar fit, grounded company research via MCP, and built-in adversarial interview defense.",
  keywords: [
    "CoverCraft AI",
    "AI cover letter",
    "evidence-based resume matching",
    "Model Context Protocol",
    "MCP server",
    "interview defense",
    "Gemini AI",
    "ATS optimization",
  ],
  authors: [{ name: "Ambuj Kumar Tripathi", url: "https://ambuj-ai-portfolio.vercel.app" }],
  creator: "Ambuj Kumar Tripathi",
  publisher: "CoverCraft AI",
  openGraph: {
    title: "CoverCraft AI — Evidence-Grounded AI Career Workspace",
    description:
      "Every claim backed by resume evidence. 5-axis competency radar fit, grounded company research via MCP, and built-in adversarial interview defense.",
    url: "https://career-workspace-ambujsystems.vercel.app",
    siteName: "CoverCraft AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoverCraft AI — Evidence-Grounded AI Career Workspace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoverCraft AI — Evidence-Grounded AI Career Workspace",
    description:
      "Every claim backed by resume evidence. 5-axis competency radar fit, grounded company research via MCP, and built-in adversarial interview defense.",
    images: ["/og-image.png"],
    creator: "@Ambuj_Tripathi",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased overflow-x-hidden`}>
      <body className="min-h-full flex flex-col bg-[#030712] text-gray-50 overflow-x-hidden w-full max-w-full">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
