import Link from "next/link";
import { getFeaturedJobs } from "@/lib/mocks/jobs.mock";
import { JobCard } from "@/components/job-card";

export const FeaturedSection = () => {
  const jobs = getFeaturedJobs().slice(0, 3);

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
