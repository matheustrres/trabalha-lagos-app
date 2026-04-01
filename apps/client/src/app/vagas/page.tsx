import { Suspense } from "react";
import type { Metadata } from "next";
import { JobSearch } from "./components/job-search";

export const metadata: Metadata = {
  title: "Vagas na Região dos Lagos",
  description:
    "Busque vagas de emprego em Cabo Frio, Búzios, Arraial do Cabo, São Pedro da Aldeia e toda a Região dos Lagos.",
};

const VagasPage = () => {
  return (
    <Suspense>
      <JobSearch />
    </Suspense>
  );
};

export default VagasPage;
