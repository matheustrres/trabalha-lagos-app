import Link from "next/link";

export const EmployerCta = () => (
  <section className="relative overflow-hidden rounded-2xl bg-linear-to-br from-gray-900 to-gray-800 p-6">
    <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />

    <div className="relative">
      <h2 className="text-lg font-bold text-white">Precisa contratar?</h2>
      <p className="mt-1.5 text-sm text-white/60">
        Publique vagas gratuitamente e encontre candidatos na Região dos Lagos.
      </p>
      <Link
        href="/painel/nova-vaga"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
      >
        Publicar vaga grátis →
      </Link>
    </div>
  </section>
);
