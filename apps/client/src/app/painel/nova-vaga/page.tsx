import { JobForm } from "./components/job-form";

const NovaVagaPage = () => (
  <div className="max-w-lg mx-auto">
    <h1 className="font-display text-xl font-bold text-gray-900">
      Publicar nova vaga
    </h1>
    <p className="text-sm text-gray-500 mt-1 mb-6">
      Preencha os dados da vaga para encontrar candidatos na Região dos Lagos.
    </p>
    <JobForm />
  </div>
);

export default NovaVagaPage;
