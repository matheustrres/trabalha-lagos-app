"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SearchX, SlidersHorizontal } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { JobListSkeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-debounce.hook";
import { RADIUS_OPTIONS } from "@/lib/constants/radius.constants";
import { CATEGORIES } from "@/lib/constants/categories.constants";
import { LAGOS_CITIES } from "@/lib/constants/cities.constants";
import { jobsService } from "@/lib/services/jobs.service";
import { cn } from "@/lib/utils/cn.utils";
import { pluralizeVagas } from "@/lib/utils/pluralize.utils";
import type { ContractType } from "@/types/job.types";

const CONTRACT_FILTER_OPTIONS: Array<{
  value: ContractType;
  label: string;
  color: string;
}> = [
  { value: "CLT", label: "CLT", color: "#0ea5e9" },
  { value: "PJ", label: "PJ", color: "#8b5cf6" },
  { value: "FREELANCER", label: "Freelancer", color: "#f59e0b" },
  { value: "TEMPORARY", label: "Temporário", color: "#ef4444" },
  { value: "INTERNSHIP", label: "Estágio", color: "#10b981" },
];

export const JobSearch = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [radius, setRadius] = useState(() => {
    const r = Number(searchParams.get("radius"));
    return RADIUS_OPTIONS.some((o) => o.value === r) ? r : 20;
  });
  const [category, setCategory] = useState<string | null>(
    searchParams.get("category"),
  );
  const [contractType, setContractType] = useState<ContractType | null>(
    searchParams.get("contractType") as ContractType | null,
  );
  const [city, setCity] = useState<string | null>(
    () => searchParams.get("city"),
  );
  const [showFilters, setShowFilters] = useState(false);
  const filtersPanelRef = useRef<HTMLDivElement | null>(null);
  const filtersButtonRef = useRef<HTMLButtonElement | null>(null);
  const page = Number(searchParams.get("page") ?? "1");

  const debouncedQuery = useDebounce(searchQuery, 300);
  const selectedCity = useMemo(
    () => LAGOS_CITIES.find((c) => c.slug === city) ?? null,
    [city],
  );
  const fallbackCenter = LAGOS_CITIES[0];
  const radiusLat = selectedCity?.lat ?? fallbackCenter.lat;
  const radiusLng = selectedCity?.lng ?? fallbackCenter.lng;
  const shouldApplyRadius = radius < 100;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      "jobs",
      debouncedQuery,
      radius,
      category,
      contractType,
      city,
      page,
    ],
    queryFn: () =>
      jobsService.search({
        ...(debouncedQuery && { q: debouncedQuery }),
        ...(shouldApplyRadius && {
            lat: String(radiusLat),
            lng: String(radiusLng),
            radius: String(radius),
          }),
        ...(category && { category }),
        ...(contractType && { contractType }),
        ...(selectedCity && { city: selectedCity.name }),
        page: String(page),
        limit: "20",
      }),
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (radius !== 20) params.set("radius", String(radius));
    if (category) params.set("category", category);
    if (contractType) params.set("contractType", contractType);
    if (city) params.set("city", city);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.replace(qs ? `/vagas?${qs}` : "/vagas", { scroll: false });
  }, [debouncedQuery, radius, category, contractType, city, page, router]);

  useEffect(() => {
    if (!showFilters) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (filtersPanelRef.current?.contains(target)) return;
      if (filtersButtonRef.current?.contains(target)) return;

      setShowFilters(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showFilters]);

  const activeFiltersCount = [category, contractType, city].filter(
    Boolean,
  ).length;

  const jobs = data?.data ?? [];
  const total = data?.meta.total ?? jobs.length;

  const queryErrorStatus =
    typeof error === "object" && error !== null && "status" in error
      ? Number(error.status)
      : undefined;

  const queryErrorMessage =
    queryErrorStatus === 429
      ? "Muitas requisições. Aguarde alguns segundos e tente novamente."
      : "Não foi possível carregar as vagas agora. Tente novamente.";

  const clearFilters = () => {
    setCategory(null);
    setContractType(null);
    setCity(null);
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2">
        <div
          className="flex-1 rounded-xl px-3 py-3 flex items-center gap-2"
          style={{
            backgroundColor: "#ffffff",
            border: "1.5px solid #9ca3af",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <Search
            className="text-gray-400 size-4 shrink-0"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar vagas, empresas..."
            aria-label="Buscar vagas ou empresas"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>

        <button
          ref={filtersButtonRef}
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "relative shrink-0 rounded-xl p-3",
            activeFiltersCount > 0
              ? "bg-primary text-white"
              : "bg-surface text-gray-500",
          )}
          aria-label="Filtros avançados"
        >
          <SlidersHorizontal className="size-4" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-sm text-gray-400 shrink-0">📍 Raio:</span>
        <div className="flex gap-1.5 overflow-x-auto">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setRadius(option.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap",
                radius === option.value
                  ? "bg-primary text-white"
                  : "bg-surface text-gray-500",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {!selectedCity && radius < 100 && (
        <p className="mt-1 text-xs text-gray-400">
          Raio aplicado a partir de Cabo Frio quando nenhuma cidade é
          selecionada.
        </p>
      )}

      {showFilters && (
        <div
          ref={filtersPanelRef}
          className="mt-3 rounded-xl bg-white border border-border px-4 py-4 space-y-4"
        >
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Tipo de contrato
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {CONTRACT_FILTER_OPTIONS.map((option) => {
                const isActive = contractType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() =>
                      setContractType(isActive ? null : option.value)
                    }
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium",
                      !isActive && "bg-surface text-gray-500",
                    )}
                    style={
                      isActive
                        ? { backgroundColor: option.color, color: "#ffffff" }
                        : undefined
                    }
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">
              Categoria
            </p>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setCategory(isActive ? null : cat.slug)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-surface text-gray-500",
                    )}
                  >
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Cidade</p>
            <div className="flex gap-1.5 flex-wrap">
              {LAGOS_CITIES.map((c) => {
                const isActive = city === c.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => setCity(isActive ? null : c.slug)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium",
                      isActive
                        ? "bg-primary text-white"
                        : "bg-surface text-gray-500",
                    )}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-error text-sm font-medium"
            >
              ✕ Limpar filtros
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {pluralizeVagas(total)} encontradas
        </span>
        <span className="text-sm text-gray-500">Ordenado por distância</span>
      </div>

      {isError && (
        <div
          role="alert"
          className="mt-3 rounded-xl bg-error/10 px-4 py-2 text-sm text-error"
        >
          {queryErrorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="mt-3">
          <JobListSkeleton count={4} />
        </div>
      ) : jobs.length > 0 ? (
        <div className="mt-3 space-y-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <SearchX className="size-10 text-gray-300" aria-hidden="true" />
          <p className="font-semibold text-gray-500">Nenhuma vaga encontrada</p>
          <p className="text-sm text-gray-400">
            Tente ampliar o raio ou mudar a busca
          </p>
        </div>
      )}
    </div>
  );
};
