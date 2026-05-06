import { Link } from "react-router-dom";
import FazendaGate from "../../components/FazendaGate";
import { getUserProfile } from "../../utils/userProfile";
import { formatArea, formatDate } from "../../utils/formatters";

function Profile() {
  return (
    <FazendaGate>
      {(activeFazenda) => <ProfileContent activeFazenda={activeFazenda} />}
    </FazendaGate>
  );
}

function ProfileContent({ activeFazenda }) {
  const profile = getUserProfile();

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Meu perfil
          </p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-950">
            {profile.nome}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Gerencie suas informações principais e consulte a fazenda vinculada
            ao ambiente atual.
          </p>
        </div>

        <Link
          to="/perfil/editar"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700"
        >
          Editar perfil
        </Link>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-5 border-b border-emerald-950/8 px-5 py-5 sm:px-6 lg:grid-cols-[12rem_1fr]">
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className="flex h-36 w-36 items-center justify-center rounded-full bg-emerald-100 text-5xl font-bold text-emerald-800">
                  {profile.nome.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-2 right-1 inline-flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-white text-emerald-800 shadow-sm">
                  <CameraIcon />
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center text-center lg:text-left">
              <div className="flex flex-col items-center gap-3 lg:flex-row">
                <h3 className="text-3xl font-bold text-emerald-950">
                  {profile.nome}
                </h3>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  {profile.perfil}
                </span>
              </div>
              <p className="mt-2 text-base text-slate-600">{profile.descricao}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 px-5 py-2 sm:px-6">
            <InfoAction icon={MailIcon} label="Email" value={profile.email} />
            <InfoAction
              icon={PhoneIcon}
              label="Telefone"
              value={profile.telefone}
            />
            <InfoAction
              icon={CalendarIcon}
              label="Conta criada em"
              value={formatDate(profile.contaCriadaEm)}
            />
            <InfoAction
              icon={LockIcon}
              label="Último acesso"
              value={profile.ultimoAcesso}
            />
          </div>
        </section>

        <div className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-800">
                <FarmIcon />
              </span>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Fazenda vinculada
                </p>
                <h3 className="mt-2 text-2xl font-bold text-emerald-950">
                  {activeFazenda.nome}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {activeFazenda.localizacao || "Localização não informada"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DataPill
                label="Área"
                value={formatArea(activeFazenda.tamanhoPropriedade)}
              />
              <DataPill
                label="Cadastro"
                value={formatDate(activeFazenda.dataCriacao)}
              />
            </div>

            <Link
              to="/fazenda"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-emerald-950/15 bg-emerald-50 px-5 py-3 text-base font-semibold text-emerald-950 transition hover:bg-emerald-100"
            >
              Ver detalhes da fazenda
            </Link>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-emerald-800">
                <ShieldIcon />
              </span>
              <h3 className="text-2xl font-bold text-emerald-950">Segurança</h3>
            </div>

            <div className="mt-5 space-y-3">
              <SecurityRow
                icon={KeyIcon}
                title="Alterar senha"
                description="Atualize sua senha de acesso"
              />
              <SecurityRow
                icon={FingerprintIcon}
                title="Configurações de conta"
                description="Preferências e privacidade"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoAction({ icon: Icon, label, value }) {
  return (
    <div className="grid gap-4 py-4 sm:grid-cols-[4rem_1fr]">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
        <Icon />
      </span>
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-emerald-950">{label}</p>
          <p className="mt-1 truncate text-sm text-slate-600">{value}</p>
        </div>
        <span className="text-slate-400">
          <ChevronIcon />
        </span>
      </div>
    </div>
  );
}

function DataPill({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-emerald-950">{value}</p>
    </div>
  );
}

function SecurityRow({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-4">
      <div className="flex items-center gap-4">
        <span className="text-emerald-800">
          <Icon />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-950">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <span className="text-slate-400">
        <ChevronIcon />
      </span>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M9.4 4.5 8 6.4H5.5A2.5 2.5 0 0 0 3 8.9v7.6A2.5 2.5 0 0 0 5.5 19h13a2.5 2.5 0 0 0 2.5-2.5V8.9a2.5 2.5 0 0 0-2.5-2.5H16l-1.4-1.9H9.4ZM12 16.8a4 4 0 1 1 0-8 4 4 0 0 1 0 8Z" />
    </svg>
  );
}

function MailIcon() {
  return <IconPath path="M4 6h16v12H4V6Zm1.8 2 6.2 5 6.2-5" />;
}

function PhoneIcon() {
  return <IconPath path="M7.5 4.5 10 7l-1.6 2c.8 1.7 2.1 3 3.8 3.8l2-1.6 2.5 2.5-1.4 3.2c-.3.7-1 1.1-1.7 1A10.8 10.8 0 0 1 5.1 9.4c-.1-.7.3-1.4 1-1.7l1.4-3.2Z" />;
}

function CalendarIcon() {
  return <IconPath path="M6 4h12v16H6V4Zm0 5h12M8 2v4m8-4v4" />;
}

function LockIcon() {
  return <IconPath path="M7 10h10v10H7V10Zm2 0V8a3 3 0 0 1 6 0v2" />;
}

function FarmIcon() {
  return <IconPath path="M4 19h16M6 18V9l6-4 6 4v9M9 18v-5h6v5" />;
}

function ShieldIcon() {
  return <IconPath path="M12 3 5 6v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z" />;
}

function KeyIcon() {
  return <IconPath path="M14 10a4 4 0 1 1-1.2-2.8L20 0m-5 5 3 3" />;
}

function FingerprintIcon() {
  return <IconPath path="M12 11c0 4-2 5-2 8m5-7c0 4-1 6-3 8M8 9a4 4 0 0 1 8 0m-11 2a7 7 0 0 1 14 0" />;
}

function ChevronIcon() {
  return <IconPath path="m9 6 6 6-6 6" />;
}

function IconPath({ path }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none">
      <path
        d={path}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default Profile;
