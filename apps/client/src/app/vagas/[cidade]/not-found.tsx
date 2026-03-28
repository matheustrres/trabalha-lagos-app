import Link from "next/link";

const NotFound = () => (
  <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
    <p className="text-lg font-semibold text-gray-900">Cidade não encontrada</p>
    <Link href="/vagas" className="text-sm text-primary hover:underline">
      Ver todas as cidades
    </Link>
  </div>
);

export default NotFound;
