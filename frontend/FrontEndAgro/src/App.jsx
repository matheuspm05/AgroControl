import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import Layout from "./components/Layout";
import { FazendaProvider } from "./context/FazendaContext";
import { getAuthToken } from "./services/api";
import { applyTheme, getStoredTheme } from "./utils/theme";

import Landing from "./pages/home/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import SetupFazenda from "./pages/auth/SetupFazenda";
import Dashboard from "./pages/dashboard/Dashboard";
import Animais from "./pages/animais/Animais";
import AnimalCreate from "./pages/animais/AnimalCreate";
import AnimalDetails from "./pages/animais/AnimalDetails";
import AnimalEdit from "./pages/animais/AnimalEdit";
import AnimalMove from "./pages/animais/AnimalMove";
import AnimalApplyRemedy from "./pages/animais/AnimalApplyRemedy";
import Pastos from "./pages/pastos/Pastos";
import PastoCreate from "./pages/pastos/PastoCreate";
import PastoDetails from "./pages/pastos/PastoDetails";
import PastoEdit from "./pages/pastos/PastoEdit";
import Currais from "./pages/currais/Currais";
import CurralCreate from "./pages/currais/CurralCreate";
import CurralDetails from "./pages/currais/CurralDetails";
import CurralEdit from "./pages/currais/CurralEdit";
import Remedios from "./pages/remedios/Remedios";
import RemedioCreate from "./pages/remedios/RemedioCreate";
import RemedioEdit from "./pages/remedios/RemedioEdit";
import Campeiros from "./pages/campeiros/Campeiros";
import CampeiroCreate from "./pages/campeiros/CampeiroCreate";
import CampeiroDetails from "./pages/campeiros/CampeiroDetails";
import CampeiroEdit from "./pages/campeiros/CampeiroEdit";
import Profile from "./pages/perfil/Profile";
import ProfileEdit from "./pages/perfil/ProfileEdit";
import FazendaDetails from "./pages/fazenda/FazendaDetails";
import Relatorios from "./pages/relatorios/Relatorios";
import Configuracoes from "./pages/configuracoes/Configuracoes";

function App() {
  useEffect(() => {
    applyTheme(getStoredTheme(), { persist: false });
  }, []);

  return (
    <FazendaProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/setup-fazenda"
            element={
              <RequireAuth>
                <SetupFazenda />
              </RequireAuth>
            }
          />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/animais" element={<Animais />} />
            <Route path="/animais/novo" element={<AnimalCreate />} />
            <Route path="/animais/:animalId/editar" element={<AnimalEdit />} />
            <Route
              path="/animais/:animalId/movimentar"
              element={<AnimalMove />}
            />
            <Route
              path="/animais/:animalId/aplicar-remedio"
              element={<AnimalApplyRemedy />}
            />
            <Route path="/animais/:animalId" element={<AnimalDetails />} />
            <Route path="/pastos" element={<Pastos />} />
            <Route path="/pastos/novo" element={<PastoCreate />} />
            <Route path="/pastos/:pastoId/editar" element={<PastoEdit />} />
            <Route path="/pastos/:pastoId" element={<PastoDetails />} />
            <Route path="/currais" element={<Currais />} />
            <Route path="/currais/novo" element={<CurralCreate />} />
            <Route path="/currais/:curralId/editar" element={<CurralEdit />} />
            <Route path="/currais/:curralId" element={<CurralDetails />} />
            <Route path="/remedios" element={<Remedios />} />
            <Route path="/remedios/novo" element={<RemedioCreate />} />
            <Route
              path="/remedios/:remedioId/editar"
              element={<RemedioEdit />}
            />
            <Route path="/campeiros" element={<Campeiros />} />
            <Route path="/campeiros/novo" element={<CampeiroCreate />} />
            <Route
              path="/campeiros/:campeiroId/editar"
              element={<CampeiroEdit />}
            />
            <Route
              path="/campeiros/:campeiroId"
              element={<CampeiroDetails />}
            />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/perfil/editar" element={<ProfileEdit />} />
            <Route path="/fazenda" element={<FazendaDetails />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </FazendaProvider>
  );
}

function RequireAuth({ children }) {
  return getAuthToken() ? children : <Navigate to="/login" replace />;
}

export default App;
