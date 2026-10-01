export default function sitemap() {
  const baseUrl = "https://career-workspace-ambujsystems.vercel.app";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/generate`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/docs`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
