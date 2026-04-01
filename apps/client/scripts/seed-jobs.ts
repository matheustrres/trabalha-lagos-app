type ContractType =
  | "CLT"
  | "PJ"
  | "FREELANCER"
  | "TEMPORARY"
  | "INTERNSHIP"
  | "OTHER";

interface Category {
  id: number;
  slug: string;
}

interface SeedJobInput {
  title: string;
  description: string;
  categorySlug: string;
  contractType: ContractType;
  city: string;
  locationLat: number;
  locationLng: number;
  salaryMin?: number;
  salaryMax?: number;
  requirements: string[];
  featured?: boolean;
  urgent?: boolean;
}

const API_URL = process.env.API_URL || "http://localhost:3001/api/v1";
const TOKEN = process.env.EMPLOYER_TOKEN;

if (!TOKEN) {
  throw new Error("Defina EMPLOYER_TOKEN para rodar o seed.");
}

const jobs: SeedJobInput[] = [
  {
    title: "Atendente de Loja",
    description:
      "Loja de utilidades em Cabo Frio busca atendente para suporte ao cliente, organização de estoque e operação de caixa.",
    categorySlug: "comercio-varejo",
    contractType: "CLT",
    city: "Cabo Frio",
    locationLat: -22.8789,
    locationLng: -42.0187,
    salaryMin: 170000,
    salaryMax: 220000,
    requirements: ["Ensino médio completo", "Boa comunicação"],
    urgent: true,
  },
  {
    title: "Camareira",
    description:
      "Pousada em Armação dos Búzios contrata camareira para limpeza, arrumação de quartos e apoio na lavanderia.",
    categorySlug: "turismo-hospitalidade",
    contractType: "CLT",
    city: "Armação dos Búzios",
    locationLat: -22.7469,
    locationLng: -41.8817,
    salaryMin: 180000,
    salaryMax: 230000,
    requirements: ["Experiência com hotelaria", "Disponibilidade aos finais de semana"],
    featured: true,
  },
  {
    title: "Auxiliar de Obras",
    description:
      "Empresa de construção em São Pedro da Aldeia busca auxiliar para apoio em canteiro, transporte de materiais e organização.",
    categorySlug: "construcao-manutencao",
    contractType: "TEMPORARY",
    city: "São Pedro da Aldeia",
    locationLat: -22.8394,
    locationLng: -42.1027,
    salaryMin: 190000,
    requirements: ["Disponibilidade imediata"],
  },
  {
    title: "Garçom",
    description:
      "Restaurante em Arraial do Cabo busca garçom para atendimento ao salão, fechamento de contas e organização das mesas.",
    categorySlug: "alimentacao",
    contractType: "CLT",
    city: "Arraial do Cabo",
    locationLat: -22.966,
    locationLng: -42.0275,
    salaryMin: 180000,
    salaryMax: 250000,
    requirements: ["Experiência em atendimento", "Agilidade e simpatia"],
  },
  {
    title: "Cabeleireira",
    description:
      "Salão em Saquarema procura cabeleireira com prática em escova, corte e coloração para atendimento fixo semanal.",
    categorySlug: "saude-beleza",
    contractType: "PJ",
    city: "Saquarema",
    locationLat: -22.92,
    locationLng: -42.5103,
    salaryMin: 220000,
    salaryMax: 350000,
    requirements: ["Portfólio de trabalhos", "Experiência comprovada"],
  },
  {
    title: "Assistente Administrativo",
    description:
      "Escritório em Araruama busca assistente para rotinas administrativas, emissão de notas e atendimento por WhatsApp.",
    categorySlug: "administrativo",
    contractType: "CLT",
    city: "Araruama",
    locationLat: -22.8729,
    locationLng: -42.3431,
    salaryMin: 200000,
    requirements: ["Pacote Office", "Organização e proatividade"],
  },
];

const parseCategories = (payload: unknown): Category[] => {
  if (Array.isArray(payload)) return payload as Category[];

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray((payload as { data: unknown }).data)
  ) {
    return (payload as { data: Category[] }).data;
  }

  return [];
};

const run = async () => {
  const categoriesResponse = await fetch(`${API_URL}/categories`);

  if (!categoriesResponse.ok) {
    throw new Error("Não foi possível carregar categorias.");
  }

  const categoriesPayload = (await categoriesResponse.json()) as unknown;
  const categories = parseCategories(categoriesPayload);

  const categoryMap = new Map(categories.map((category) => [category.slug, category.id]));
  const fallbackCategoryId = categories[0]?.id;

  if (!fallbackCategoryId) {
    throw new Error("Nenhuma categoria encontrada para criar vagas.");
  }

  for (const job of jobs) {
    const categoryId = categoryMap.get(job.categorySlug) ?? fallbackCategoryId;

    const response = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        title: job.title,
        description: job.description,
        categoryId,
        contractType: job.contractType,
        city: job.city,
        locationLat: job.locationLat,
        locationLng: job.locationLng,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryHidden: false,
        whatsappContact: "22999990000",
        contactMethod: "WHATSAPP",
        requirements: job.requirements,
        featured: job.featured ?? false,
        urgent: job.urgent ?? false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Erro ao criar vaga \"${job.title}\": ${errorBody}`);
    }

    const createdJob = (await response.json()) as { slug: string };
    console.log(`✅ Vaga criada: ${createdJob.slug}`);
  }

  console.log("\nSeed finalizado com sucesso.");
};

run();
