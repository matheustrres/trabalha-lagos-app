import Link from "next/link";
import { JobCard } from "@/components/job-card";
import {
  fetchServerJson,
  normalizePaginatedResponse,
  SERVER_API_URL,
} from "@/lib/server-api";
import type { Job } from "@/types/job.types";

export const FeaturedSection = async () => {
  const payload = await fetchServerJson<{ data?: Job[] } | Job[]>(
    `${SERVER_API_URL}/jobs?featured=true&limit=3`,
    { data: [] },
    { next: { revalidate: 600 } },
  );

  const { data: jobs } = normalizePaginatedResponse(payload, 1, 3);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Em destaque ⭐</h2>
        <Link href="/vagas" className="text-sm font-medium text-primary">
          Ver todas →
        </Link>
      </div>

      <div className="space-y-2.5">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
};
