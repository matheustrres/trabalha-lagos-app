import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-4xl mb-4">🔍</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">
        Vaga não encontrada
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Esta vaga pode ter sido encerrada ou o link está incorreto.
      </p>
      <Link
        href="/vagas"
        className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
      >
        Ver todas as vagas →
      </Link>
    </div>
  );
}
