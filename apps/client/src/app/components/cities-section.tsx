"use client";

import Link from "next/link";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { getJobsCountByCity } from "@/lib/mocks/jobs.mock";

export const CitiesSection = () => (
  <section>
    <h2 className="mb-3 text-base font-bold text-gray-900">Cidades</h2>

    <div className="flex gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {LAGOS_CITIES.map((city) => {
        const count = getJobsCountByCity(city.slug);
        return (
          <Link
            key={city.slug}
            href={`/vagas/${city.slug}`}
            className="shrink-0 rounded-xl border border-border bg-white px-4 py-3"
          >
            <p className="text-sm font-semibold text-gray-900">{city.name}</p>
            <p className="mt-0.5 text-xs font-medium text-primary">
              {count} vagas
            </p>
          </Link>
        );
      })}
    </div>
  </section>
);
