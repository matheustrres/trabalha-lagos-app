import Link from "next/link";
import { MOCK_JOBS } from "@/lib/mocks/jobs.mock";

export const HeroSection = () => (
  <div className="relative overflow-hidden bg-linear-to-br from-primary via-primary-dark to-primary-dark/90 px-6 pt-12 pb-10">
    <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/5" />
    <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
    <div className="absolute top-1/2 right-1/4 h-20 w-20 rounded-full bg-white/5" />

    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl">
          ⚡
        </div>
        <span className="font-display text-xl font-bold text-white">
          TrabalhaLagos
        </span>
      </div>

      <h1 className="mt-6 font-display text-3xl font-extrabold text-white">
        Encontre trabalho
        <br />
        <span className="text-primary-light">perto de você</span>
      </h1>

      <p className="mt-2 text-sm text-white/75">
        Vagas na Região dos Lagos — de bico a CLT, tudo em um lugar só.
      </p>

      <Link
        href="/vagas"
        className="mt-5 flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm"
      >
        <span className="text-gray-400" aria-hidden>
          🔍
        </span>
        <span className="text-sm text-gray-400">Buscar vagas, empresas...</span>
      </Link>

      <div className="mt-6 flex gap-6">
        <div>
          <p className="text-xl font-bold text-white">{MOCK_JOBS.length}</p>
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
