import { HeroSearchInput } from "./hero-search-input";

interface HeroSectionProps {
  totalJobs: number;
}

export const HeroSection = ({ totalJobs }: HeroSectionProps) => (
  <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary-dark to-primary-dark/90 px-6 pt-12 pb-10">
    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />

    <div className="relative">
      <h1 className="font-display text-3xl font-extrabold text-white">
        Encontre trabalho
        <br />
        <span className="text-primary-light">perto de você</span>
      </h1>

      <p className="mt-2 text-sm text-white/75">
        Vagas na Região dos Lagos — de bico a CLT, tudo em um lugar só.
      </p>

      <HeroSearchInput />

      <div className="mt-6 flex gap-6">
        <div>
          <p className="text-xl font-bold text-white">{totalJobs}</p>
          <p className="text-xs text-white/60">vagas ativas</p>
        </div>
        <div>
          <p className="text-xl font-bold text-white">7</p>
          <p className="text-xs text-white/60">cidades</p>
        </div>
        <div>
          <p className="text-xl font-bold text-white">10+</p>
          <p className="text-xs text-white/60">empresas</p>
        </div>
      </div>
    </div>
  </div>
);
