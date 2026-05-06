import { useMemo, useState } from "react";
import { matchPath, Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const pageMeta = [
  {
    path: "/dashboard",
    title: "Dashboard",
    description: "Visão geral da fazenda com indicadores e acessos rápidos.",
  },
  {
    path: "/animais/novo",
    title: "Cadastrar Animal",
    description: "Adicione um novo animal e vincule o local inicial do registro.",
  },
  {
    path: "/animais/:animalId/editar",
    title: "Editar Animal",
    description: "Atualize os dados principais do animal sem perder o histórico.",
  },
  {
    path: "/animais/:animalId/movimentar",
    title: "Movimentar Animal",
    description: "Registre a troca de local do animal e mantenha o histórico íntegro.",
  },
  {
    path: "/animais/:animalId/aplicar-remedio",
    title: "Aplicar Remédio",
    description: "Associe um remédio ao animal com dose, data e observações.",
  },
  {
    path: "/animais/:animalId",
    title: "Detalhes do Animal",
    description: "Consulte dados do animal e seu histórico de movimentações e aplicações.",
  },
  {
    path: "/animais",
    title: "Animais",
    description: "Acompanhe o rebanho e mantenha a organização dos registros.",
  },
  {
    path: "/pastos/novo",
    title: "Cadastrar Pasto",
    description: "Cadastre um novo pasto com área e tipo de vegetação.",
  },
  {
    path: "/pastos/:pastoId/editar",
    title: "Editar Pasto",
    description: "Atualize os dados do pasto e avalie se ele já possui animais vinculados.",
  },
  {
    path: "/pastos/:pastoId",
    title: "Detalhes do Pasto",
    description: "Visualize os dados do pasto e os animais atualmente alocados nele.",
  },
  {
    path: "/pastos",
    title: "Pastos",
    description: "Controle locais de manejo e a distribuição dos animais.",
  },
  {
    path: "/currais/novo",
    title: "Cadastrar Curral",
    description: "Cadastre um novo curral com capacidade máxima para o manejo.",
  },
  {
    path: "/currais/:curralId/editar",
    title: "Editar Curral",
    description: "Atualize os dados do curral e avalie se ele já possui animais vinculados.",
  },
  {
    path: "/currais/:curralId",
    title: "Detalhes do Curral",
    description: "Visualize os dados do curral e os animais atualmente alocados nele.",
  },
  {
    path: "/currais",
    title: "Currais",
    description: "Gerencie espaços de apoio e sua capacidade operacional.",
  },
  {
    path: "/remedios/novo",
    title: "Cadastrar Remédio",
    description: "Cadastre um novo remédio com descrição e dose padrão para uso no rebanho.",
  },
  {
    path: "/remedios/:remedioId/editar",
    title: "Editar Remédio",
    description: "Atualize os dados do remédio e controle seu status ativo ou inativo.",
  },
  {
    path: "/remedios",
    title: "Remédios",
    description: "Mantenha o estoque e os dados principais dos remédios.",
  },
  {
    path: "/campeiros/novo",
    title: "Cadastrar Campeiro",
    description: "Cadastre um novo membro da equipe de apoio da fazenda.",
  },
  {
    path: "/campeiros/:campeiroId/editar",
    title: "Editar Campeiro",
    description: "Atualize os dados cadastrais e de trabalho do campeiro.",
  },
  {
    path: "/campeiros/:campeiroId",
    title: "Detalhes do Campeiro",
    description: "Consulte as informações completas do campeiro cadastrado.",
  },
  {
    path: "/campeiros",
    title: "Campeiros",
    description: "Visualize a equipe de apoio da fazenda em um só lugar.",
  },
  {
    path: "/perfil/editar",
    title: "Editar Perfil",
    description: "Atualize suas informações principais de usuário.",
  },
  {
    path: "/perfil",
    title: "Meu Perfil",
    description: "Gerencie suas informações e preferências.",
  },
  {
    path: "/fazenda",
    title: "Fazenda",
    description: "Consulte os dados da fazenda vinculada ao ambiente atual.",
  },
  {
    path: "/relatorios",
    title: "Relatórios",
    description: "Acompanhe indicadores resumidos da operação da fazenda.",
  },
  {
    path: "/configuracoes",
    title: "Configurações",
    description: "Ajuste preferências de conta, segurança e aparência.",
  },
];

function Layout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const currentPage = useMemo(
    () =>
      pageMeta.find((item) =>
        matchPath({ path: item.path, end: true }, location.pathname),
      ) ?? pageMeta[0],
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="lg:pl-72">
        <Header
          title={currentPage.title}
          description={currentPage.description}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[120rem] px-3 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pt-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
