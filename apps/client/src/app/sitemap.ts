import type { MetadataRoute } from "next";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";

const sitemap = (): MetadataRoute.Sitemap => {
  const cityPages = LAGOS_CITIES.map((city) => ({
    url: `https://trabalhalagos.com.br/vagas/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://trabalhalagos.com.br",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://trabalhalagos.com.br/vagas",
      lastModified: new Date(),
      priority: 0.9,
    },
    ...cityPages,
  ];
};

export default sitemap;
