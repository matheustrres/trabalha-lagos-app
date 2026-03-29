import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ContractType } from "@/types/job.types";
import { getJobBySlug } from "@/lib/mocks/jobs.mock";
import { JobDetailContent } from "./components/job-detail-content";
import { JobActions } from "./components/job-actions";

interface Props {
  params: Promise<{ slug: string }>;
}

const mapContractType = (contractType: ContractType): string => {
  const map: Record<ContractType, string> = {
    CLT: "FULL_TIME",
    PJ: "CONTRACTOR",
    TEMPORARY: "TEMPORARY",
    FREELANCER: "OTHER",
    INTERNSHIP: "INTERN",
    OTHER: "OTHER",
  };
  return map[contractType];
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const job = getJobBySlug(slug);
  if (!job) return {};

  const salary = job.salaryMin
    ? `R$ ${job.salaryMin.toLocaleString("pt-BR")} - R$ ${job.salaryMax?.toLocaleString("pt-BR")}`
    : "A combinar";

  return {
    title: `${job.title} — ${job.company.name}`,
    description: `Vaga de ${job.title} em ${job.city}. ${salary}. ${job.description.slice(0, 120)}...`,
    openGraph: {
      title: `${job.title} em ${job.city} — TrabalhaLagos`,
      description: `${job.contractType} • ${salary}`,
      url: `https://trabalhalagos.com.br/vaga/${slug}`,
    },
  };
};

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const job = getJobBySlug(slug);

  if (!job) notFound();

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    validThrough: job.expiresAt,
    employmentType: mapContractType(job.contractType),
    hiringOrganization: {
      "@type": "Organization",
      name: job.company.name,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressRegion: "RJ",
        addressCountry: "BR",
      },
    },
    ...(job.salaryMin && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "BRL",
        value: {
          "@type": "QuantitativeValue",
          minValue: job.salaryMin,
          maxValue: job.salaryMax,
          unitText: "MONTH",
        },
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobDetailContent job={job} />
      <JobActions
        whatsappContact={job.company.whatsapp}
        jobTitle={job.title}
        jobCity={job.city}
        jobSlug={job.slug}
        companyName={job.company.name}
        jobId={job.id}
      />
    </>
  );
}
