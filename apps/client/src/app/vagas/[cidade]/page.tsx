import { notFound } from "next/navigation";
import Link from "next/link";
import { SearchX } from "lucide-react";
import type { Metadata } from "next";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { fetchServerJson, SERVER_API_URL } from "@/lib/server-api";
import { pluralizeVagas } from "@/lib/utils/pluralize.utils";
import { JobCard } from "@/components/job-card";
import type { SearchJob } from "@/types/job.types";

interface Props {
  params: Promise<{ cidade: string }>;
}

export const revalidate = 600;

export const generateStaticParams = () =>
  LAGOS_CITIES.map((city) => ({ cidade: city.slug }));

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { cidade } = await params;
  const city = LAGOS_CITIES.find((c) => c.slug === cidade);
  if (!city) return {};

  return {
    title: `Vagas em ${city.name} — TrabalhaLagos`,
    description: `Encontre vagas de emprego em ${city.name}, Região dos Lagos. CLT, PJ, freelancer e temporário.`,
    openGraph: {
      title: `Vagas em ${city.name} — TrabalhaLagos`,
      url: `https://trabalhalagos.com.br/vagas/${cidade}`,
    },
  };
};

const CidadePage = async ({ params }: Props) => {
  const { cidade } = await params;
  const city = LAGOS_CITIES.find((c) => c.slug === cidade);

  if (!city) notFound();

  const payload = await fetchServerJson<{ data?: SearchJob[] } | SearchJob[]>(
    `${SERVER_API_URL}/jobs?city=${encodeURIComponent(city.name)}&limit=50`,
    { data: [] },
    { next: { revalidate: 600 } },
  );

  const jobsData = Array.isArray(payload) ? payload : (payload.data ?? []);

  const jobs = jobsData.sort((a, b) => {
    const aFeatured = a.sourceType !== "EXTERNAL" && a.featured;
    const bFeatured = b.sourceType !== "EXTERNAL" && b.featured;
    if (aFeatured === bFeatured) return 0;
    return aFeatured ? -1 : 1;
  });

  return (
    <div className="px-4 py-6">
      <Link
        href="/vagas"
        className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-primary"
      >
        ← Todas as cidades
      </Link>

      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {city.name}
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {pluralizeVagas(jobs.length)}
          </p>
        </div>
        <Link
          href={`/vagas?city=${cidade}`}
          className="text-sm font-medium text-primary"
        >
          Buscar com filtros →
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <SearchX size={40} className="text-gray-300" aria-hidden />
          <p className="font-semibold text-gray-500">
            Nenhuma vaga em {city.name}
          </p>
          <p className="text-sm text-gray-400">
            Novas oportunidades aparecem em breve
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CidadePage;
