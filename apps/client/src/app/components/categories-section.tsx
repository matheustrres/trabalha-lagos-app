import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories.constants";

const CATEGORY_JOB_COUNTS: Record<string, number> = {
  "comercio-varejo": 3,
  "turismo-hospitalidade": 4,
  "construcao-manutencao": 2,
  "servicos-gerais": 1,
  alimentacao: 2,
  "saude-beleza": 1,
};

export const CategoriesSection = () => {
  const topCategories = CATEGORIES.slice(0, 6);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Categorias</h2>
        <Link href="/vagas" className="text-sm font-medium text-primary">
          Ver todas →
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {topCategories.map((category) => (
          <Link
            key={category.slug}
            href="/vagas"
            className="rounded-xl border border-border bg-white p-3 text-center"
          >
            <p className="text-2xl" aria-hidden>
              {category.icon}
            </p>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {category.name}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-primary">
              {CATEGORY_JOB_COUNTS[category.slug] ?? 0} vagas
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
