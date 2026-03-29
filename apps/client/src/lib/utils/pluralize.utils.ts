export const pluralizeVagas = (count: number): string => {
  if (count === 0) return "Nenhuma vaga";
  if (count === 1) return "1 vaga";
  return `${count} vagas`;
};
