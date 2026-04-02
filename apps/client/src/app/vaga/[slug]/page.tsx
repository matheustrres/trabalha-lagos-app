import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { SERVER_API_URL } from "@/lib/server-api";
import type { ContractType, Job } from "@/types/job.types";
import { formatSalaryRange } from "@/lib/utils/format-salary.utils";
import { JobDetailContent } from "./components/job-detail-content";
import { JobActions } from "./components/job-actions";

const getClientHeaders = async (): Promise<Record<string, string>> => {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "";
  const userAgent = headersList.get("user-agent") ?? "";
  return {
    "x-forwarded-for": forwardedFor,
    "user-agent": userAgent,
  };
};

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

const getJobBySlug = async (slug: string): Promise<Job | null> => {
  try {
    const clientHeaders = await getClientHeaders();
    const response = await fetch(`${SERVER_API_URL}/jobs/${slug}`, {
      headers: clientHeaders,
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as Job;
  } catch {
    return null;
  }
};

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) return {};

  const salary = formatSalaryRange(job.salaryMin, job.salaryMax);

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
  const job = await getJobBySlug(slug);

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
        whatsappContact={job.company.whatsapp ?? job.whatsappContact ?? ""}
        jobTitle={job.title}
        jobCity={job.city}
        jobSlug={job.slug}
        companyName={job.company.name}
        jobId={job.id}
      />
    </>
  );
}
