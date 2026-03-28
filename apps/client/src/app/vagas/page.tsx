import Link from "next/link";
import type { Metadata } from "next";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { MOCK_JOBS, getJobsCountByCity } from "@/lib/mocks/jobs.mock";

export const metadata: Metadata = {
  title: "Vagas na Região dos Lagos — TrabalhaLagos",
  description:
    "Encontre vagas de emprego em Cabo Frio, Búzios, Arraial do Cabo, São Pedro da Aldeia e toda a Região dos Lagos.",
};

const VagasPage = () => (
  <div className="px-4 py-6">
    <h1 className="font-display text-2xl font-bold text-gray-900">
      Vagas na Região dos Lagos
    </h1>
    <p className="mt-1 text-sm text-gray-500">
      Escolha uma cidade para ver as vagas disponíveis
    </p>

    <div className="mt-6 grid grid-cols-1 gap-3">
      {LAGOS_CITIES.map((city) => {
        const count = getJobsCountByCity(city.slug);
        return (
          <Link
            key={city.slug}
            href={`/vagas/${city.slug}`}
            className="rounded-2xl border border-border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <p className="text-base font-semibold text-gray-900">{city.name}</p>
            <p className="mt-1 text-sm font-medium text-primary">
              {count} vagas
            </p>
          </Link>
        );
      })}
    </div>

    <p className="mt-4 text-center text-sm text-gray-400">
      Total: {MOCK_JOBS.length} vagas em {LAGOS_CITIES.length} cidades
    </p>
  </div>
);

export default VagasPage;
