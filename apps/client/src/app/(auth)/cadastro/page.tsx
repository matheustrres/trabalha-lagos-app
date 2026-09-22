import type { Metadata } from "next";
import { RegisterForm } from "./components/register-form";

export const metadata: Metadata = {
  title: "Criar conta",
};

const CadastroPage = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-border">
    <div className="px-6 py-8">
      <h1 className="text-xl font-bold text-gray-900">Crie sua conta</h1>
      <p className="mt-1 mb-4 text-sm text-gray-500">
        Escolha como quer usar o TrabalhaLagos
      </p>
      <RegisterForm />
    </div>
  </div>
);

export default CadastroPage;
