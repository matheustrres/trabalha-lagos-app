export const formatSalary = (value: number): string =>
  `R$ ${value.toLocaleString("pt-BR")}`;

export const formatSalaryRange = (
  min?: number | null,
  max?: number | null,
): string => {
  if (!min && !max) return "A combinar";
  if (min && max && min === max) return formatSalary(min);
  if (min && max) return `${formatSalary(min)} – ${formatSalary(max)}`;
  if (min) return `A partir de ${formatSalary(min)}`;
  return `Até ${formatSalary(max!)}`;
};
