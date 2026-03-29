import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center text-center">
        <SearchX size={48} className="text-gray-300" />
        <h1 className="mt-4 text-xl font-bold text-gray-900">
          Página não encontrada
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 w-full max-w-xs items-center justify-center rounded-xl bg-primary px-4 text-base font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  );
}
