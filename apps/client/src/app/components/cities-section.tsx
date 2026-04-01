import Link from "next/link";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import {
  fetchServerJson,
  normalizePaginatedResponse,
  SERVER_API_URL,
} from "@/lib/server-api";
import { pluralizeVagas } from "@/lib/utils/pluralize.utils";
import type { Job } from "@/types/job.types";

export const CitiesSection = async () => {
  const citiesWithCount = await Promise.all(
    LAGOS_CITIES.map(async (city) => {
      const payload = await fetchServerJson<
        { data?: Job[]; meta?: { total?: number } } | Job[]
      >(
        `${SERVER_API_URL}/jobs?city=${encodeURIComponent(city.name)}&limit=1`,
        { data: [], meta: { total: 0 } },
        { next: { revalidate: 600 } },
      );

      const { meta } = normalizePaginatedResponse(payload, 1, 1);
      const count = meta.total;

      return { ...city, count };
    }),
  );

  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-gray-900">Cidades</h2>

      <div className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 pr-1 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300/80 [&::-webkit-scrollbar-thumb]:hover:bg-slate-400/90">
        {citiesWithCount.map((city) => {
          const count = city.count;
          return (
            <Link
              key={city.slug}
              href={`/vagas/${city.slug}`}
              className="shrink-0 snap-start rounded-xl border border-border bg-white px-4 py-3 transition-all duration-150 hover:shadow-md active:scale-[0.98]"
            >
              <p className="text-sm font-semibold text-gray-900">{city.name}</p>
              <p className="mt-0.5 text-xs font-medium text-primary">
                {pluralizeVagas(count)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
