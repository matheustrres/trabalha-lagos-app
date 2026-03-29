import { Suspense } from "react";
import type { Metadata } from "next";
import { MOCK_JOBS } from "@/lib/mocks/jobs.mock";
import { JobSearch } from "./components/job-search";

export const metadata: Metadata = {
  title: "Vagas na Região dos Lagos",
  description:
    "Busque vagas de emprego em Cabo Frio, Búzios, Arraial do Cabo, São Pedro da Aldeia e toda a Região dos Lagos.",
};

const VagasPage = () => {
  const jobs = MOCK_JOBS;
  return (
    <Suspense>
      <JobSearch initialJobs={jobs} />
    </Suspense>
  );
};

export default VagasPage;
