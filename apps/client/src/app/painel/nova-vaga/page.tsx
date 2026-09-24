import { JobForm } from "./components/job-form";

const NovaVagaPage = () => (
  <div className="mx-auto max-w-3xl">
    <h1 className="font-sans text-2xl font-bold text-gray-900">
      Publicar nova vaga
    </h1>
    <p className="text-sm text-gray-500 mt-1 mb-6">
      Preencha os dados da vaga para encontrar candidatos na Região dos Lagos.
    </p>
    <JobForm />
  </div>
);

export default NovaVagaPage;
