export default function robots() {
  const baseUrl = "https://career-workspace-ambujsystems.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
