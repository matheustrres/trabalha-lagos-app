import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/categories.constants";
import { fetchServerJson, SERVER_API_URL } from "@/lib/server-api";
import { pluralizeVagas } from "@/lib/utils/pluralize.utils";

interface CategoryResponse {
  slug: string;
  count?: number;
  jobCount?: number;
  jobsCount?: number;
  activeJobsCount?: number;
}

export const CategoriesSection = async () => {
  const categories = await fetchServerJson<CategoryResponse[]>(
    `${SERVER_API_URL}/categories`,
    [],
    { next: { revalidate: 600 } },
  );

  const categoryCounts = categories.reduce<Record<string, number>>((acc, item) => {
    acc[item.slug] =
      item.count ??
      item.jobCount ??
      item.jobsCount ??
      item.activeJobsCount ??
      0;
    return acc;
  }, {});

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
            href={`/vagas?category=${category.slug}`}
            className="flex min-h-[136px] flex-col items-center rounded-xl border border-border bg-white p-3 text-center transition-all duration-150 hover:shadow-md active:scale-[0.98]"
          >
            <p className="text-2xl" aria-hidden>
              {category.icon}
            </p>
            <p className="mt-1 min-h-8 text-xs leading-4 font-medium text-gray-500 line-clamp-2">
              {category.name}
            </p>
            <p className="mt-auto pt-1 text-xs font-semibold text-primary">
              {pluralizeVagas(categoryCounts[category.slug] ?? 0)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
