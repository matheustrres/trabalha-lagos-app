import type { Metadata } from "next";
import { LoginForm } from "./components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

const LoginPage = () => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-border">
    <div className="px-6 py-8">
      <h1 className="text-xl font-bold text-gray-900">Bem-vindo de volta</h1>
      <p className="mt-1 mb-6 text-sm text-gray-500">
        Entre com seu WhatsApp e senha
      </p>
      <LoginForm />
    </div>
  </div>
);

export default LoginPage;
