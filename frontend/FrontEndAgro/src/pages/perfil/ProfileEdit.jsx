import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Input from "../../components/Input";
import SelectField from "../../components/SelectField";
import StatusBanner from "../../components/StatusBanner";
import { getUserProfile, saveUserProfile } from "../../utils/userProfile";

const PERFIL_OPTIONS = [
  { value: "Administrador", label: "Administrador" },
  { value: "Usuário", label: "Usuário" },
  { value: "Operador", label: "Operador" },
];

function ProfileEdit() {
  const navigate = useNavigate();
  const profile = getUserProfile();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    nome: profile.nome,
    email: profile.email,
    telefone: profile.telefone,
    perfil: profile.perfil,
    descricao: profile.descricao,
  });

  function updateField(field) {
    return (event) => {
      setSaved(false);
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveUserProfile(form);
    setSaved(true);
    navigate("/perfil");
  }

  return (
    <div className="space-y-5">
      {saved ? (
        <StatusBanner
          variant="success"
          title="Perfil atualizado"
          message="As informações do usuário foram atualizadas neste navegador."
        />
      ) : null}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-emerald-950/8 px-5 py-5 sm:px-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Meu perfil
            </p>
            <h2 className="mt-2 text-2xl font-bold text-emerald-950">
              Editar perfil
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Atualize as informações exibidas no perfil do usuário. No ambiente
              atual, esses dados ficam salvos localmente no navegador.
            </p>
          </div>

          <Link
            to="/perfil"
            className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
          >
            Voltar para perfil
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Nome"
              value={form.nome}
              onChange={updateField("nome")}
              required
            />

            <SelectField
              label="Perfil"
              options={PERFIL_OPTIONS}
              value={form.perfil}
              onChange={updateField("perfil")}
            />

            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={updateField("email")}
              required
            />

            <Input
              label="Telefone"
              value={form.telefone}
              onChange={updateField("telefone")}
            />

            <Input
              label="Descrição"
              value={form.descricao}
              onChange={updateField("descricao")}
              className="lg:col-span-2"
              multiline
              rows={3}
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/perfil"
              className="inline-flex items-center justify-center rounded-lg border border-emerald-950/15 bg-white px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-50"
            >
              Cancelar
            </Link>

            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ProfileEdit;
