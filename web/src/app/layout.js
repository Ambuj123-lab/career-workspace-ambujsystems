import { Inter } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "AI Cover Letter Generator | Evidence-Grounded, JD-Aware",
  description:
    "Generate professional, ATS-ready cover letters powered by Gemini AI with evidence-backed job matching, company research grounding, and interview defense preparation.",
  keywords: [
    "AI cover letter",
    "cover letter generator",
    "JD matching",
    "ATS optimization",
    "Gemini AI",
    "MCP server",
  ],
  authors: [{ name: "Ambuj Kumar Tripathi" }],
  openGraph: {
    title: "AI Cover Letter Generator",
    description: "Evidence-grounded cover letters with AI analysis",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#030712] text-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
