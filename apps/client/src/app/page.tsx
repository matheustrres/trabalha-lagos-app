import type { Metadata } from "next";
import {
  fetchServerJson,
  normalizePaginatedResponse,
  SERVER_API_URL,
} from "@/lib/server-api";
import type { Job } from "@/types/job.types";
import { HeroSection } from "./components/hero-section";
import { CategoriesSection } from "./components/categories-section";
import { CitiesSection } from "./components/cities-section";
import { FeaturedSection } from "./components/featured-section";
import { HomeCta } from "./components/home-cta";

export const metadata: Metadata = {
  title: "TrabalhaLagos — Vagas de emprego na Região dos Lagos",
  description:
    "Encontre trabalho perto de você na Região dos Lagos. Vagas CLT, PJ, freelancer e temporário.",
};

const HomePage = async () => {
  const payload = await fetchServerJson<{ data?: Job[]; meta?: { total?: number } } | Job[]>(
    `${SERVER_API_URL}/jobs?limit=1`,
    { data: [], meta: { total: 0 } },
    { next: { revalidate: 600 } },
  );

  const { meta } = normalizePaginatedResponse(payload, 1, 1);
  const totalJobs = meta.total;

  return (
    <div>
      <HeroSection totalJobs={totalJobs} />
      <div className="space-y-6 px-4 py-6">
        <CategoriesSection />
        <CitiesSection />
        <FeaturedSection />
        <HomeCta />
      </div>
    </div>
  );
};

export default HomePage;
