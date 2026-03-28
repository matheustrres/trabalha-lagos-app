import type { Metadata } from "next";
import { HeroSection } from "./components/hero-section";
import { CategoriesSection } from "./components/categories-section";
import { CitiesSection } from "./components/cities-section";
import { FeaturedSection } from "./components/featured-section";
import { EmployerCta } from "./components/employer-cta";

export const metadata: Metadata = {
  title: "TrabalhaLagos — Vagas de emprego na Região dos Lagos",
  description:
    "Encontre trabalho perto de você na Região dos Lagos. Vagas CLT, PJ, freelancer e temporário.",
};

const HomePage = () => (
  <div>
    <HeroSection />
    <div className="space-y-6 px-4 py-6">
      <CategoriesSection />
      <CitiesSection />
      <FeaturedSection />
      <EmployerCta />
    </div>
  </div>
);

export default HomePage;
