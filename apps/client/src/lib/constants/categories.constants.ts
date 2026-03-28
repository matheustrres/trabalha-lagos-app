export const CATEGORIES = [
  { slug: "comercio-varejo", name: "Comércio e Varejo", icon: "🏪" },
  {
    slug: "turismo-hospitalidade",
    name: "Turismo e Hospitalidade",
    icon: "🏨",
  },
  {
    slug: "construcao-manutencao",
    name: "Construção e Manutenção",
    icon: "🔨",
  },
  { slug: "servicos-gerais", name: "Serviços Gerais", icon: "🧹" },
  { slug: "alimentacao", name: "Alimentação", icon: "🍽️" },
  { slug: "saude-beleza", name: "Saúde e Beleza", icon: "💇" },
  { slug: "educacao", name: "Educação", icon: "📚" },
  { slug: "administrativo", name: "Administrativo", icon: "📋" },
  { slug: "tecnologia-remoto", name: "Tecnologia e Remoto", icon: "💻" },
  { slug: "outros", name: "Outros", icon: "📦" },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategorySlug = Category["slug"];
