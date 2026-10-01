import { Inter } from "next/font/google";
import Script from "next/script";
import Providers from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "G-RZPS5NW5XT";

export const metadata = {
  metadataBase: new URL("https://career-workspace-ambujsystems.vercel.app"),
  title: "CoverCraft AI by Ambuj Kumar Tripathi | Evidence-Grounded AI Career Workspace",
  description:
    "Architected by Ambuj Kumar Tripathi [Featured in UptimeRobot Global Spotlight]. Every claim backed by resume evidence, 5-axis competency radar fit, cited company research via MCP, and adversarial interview defense.",
  keywords: [
    "Ambuj Kumar Tripathi",
    "Ambuj Tripathi",
    "CoverCraft AI",
    "GenAI Engineer",
    "AI cover letter",
    "evidence-based resume matching",
    "Model Context Protocol",
    "MCP server",
    "interview defense",
    "Gemini AI",
    "ATS optimization",
    "UptimeRobot Spotlight",
  ],
  authors: [{ name: "Ambuj Kumar Tripathi", url: "https://ambuj-ai-portfolio.vercel.app" }],
  creator: "Ambuj Kumar Tripathi",
  publisher: "Ambuj Kumar Tripathi",
  applicationName: "CoverCraft AI by Ambuj Kumar Tripathi",
  openGraph: {
    title: "CoverCraft AI — Architected by Ambuj Kumar Tripathi",
    description:
      "Architected by Ambuj Kumar Tripathi [UptimeRobot Global Spotlight Featured]. Evidence-grounded career workspace: 5-axis competency radar fit, cited MCP research, and built-in interview defense.",
    url: "https://career-workspace-ambujsystems.vercel.app",
    siteName: "CoverCraft AI by Ambuj Kumar Tripathi",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CoverCraft AI — Architected by Ambuj Kumar Tripathi",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoverCraft AI — Architected by Ambuj Kumar Tripathi",
    description:
      "Architected by Ambuj Kumar Tripathi [UptimeRobot Spotlight Featured]. Evidence-grounded career workspace with 5-axis competency radar, cited MCP research, and interview defense.",
    images: ["/og-image.png"],
    creator: "@Ambuj_Tripathi",
    site: "@Ambuj_Tripathi",
  },
  other: {
    "author": "Ambuj Kumar Tripathi",
    "developer": "Ambuj Kumar Tripathi",
    "profile:first_name": "Ambuj",
    "profile:last_name": "Tripathi",
    "profile:username": "Ambuj123-lab",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CoverCraft AI",
    alternateName: "CoverCraft AI by Ambuj Kumar Tripathi",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: "https://career-workspace-ambujsystems.vercel.app",
    author: {
      "@type": "Person",
      name: "Ambuj Kumar Tripathi",
      url: "https://ambuj-ai-portfolio.vercel.app",
      jobTitle: "Independent GenAI Engineer",
      sameAs: [
        "https://github.com/Ambuj123-lab",
        "https://www.linkedin.com/in/ambuj-tripathi-042b4a118/",
        "https://uptimerobot.com/blog/community-spotlight-ambuj-kumar-tripathi/"
      ]
    },
    creator: {
      "@type": "Person",
      name: "Ambuj Kumar Tripathi"
    },
    description:
      "Evidence-grounded career workspace architected by Ambuj Kumar Tripathi. Features 5-axis competency radar fit, cited company research via MCP, and adversarial interview defense.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    }
  };

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#030712] text-gray-50 overflow-x-clip w-full max-w-full">
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
