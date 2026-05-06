import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../../components/Logo";
import heroBackground from "../../assets/images/fundo fazenda.png";
import dashboardPreview from "../../assets/images/print dashbord.png";
import { applyTheme, getStoredTheme } from "../../utils/theme";

const trustCards = [
  {
    title: "Seguro",
    description: "Seus dados protegidos com rotinas claras e acesso controlado.",
    icon: ShieldIcon,
  },
  {
    title: "Simples",
    description: "Interface intuitiva para usar no escritório ou direto no campo.",
    icon: ClockIcon,
  },
  {
    title: "Organizado",
    description: "Informações claras para decisões melhores e mais rápidas.",
    icon: ChartIcon,
  },
];

const resources = [
  {
    title: "Gestão de Animais",
    description: "Cadastre e acompanhe seus animais com informações completas.",
    icon: AnimalIcon,
  },
  {
    title: "Pastos e Currais",
    description: "Organize locais, capacidade, ocupação e estrutura da fazenda.",
    icon: GrassIcon,
  },
  {
    title: "Aplicações",
    description: "Registre e acompanhe aplicações de medicamentos e tratamentos.",
    icon: SyringeIcon,
  },
  {
    title: "Movimentações",
    description: "Controle entradas, saídas e transferências de animais com histórico.",
    icon: MoveIcon,
  },
  {
    title: "Relatórios",
    description: "Relatórios simples e objetivos para analisar o desempenho.",
    icon: ClipboardIcon,
  },
  {
    title: "Equipe",
    description: "Gerencie campeiros e permissões de acesso ao sistema.",
    icon: TeamIcon,
  },
];

const steps = [
  {
    number: "1",
    title: "Crie sua conta",
    description: "Cadastre-se em poucos minutos e tenha acesso ao sistema.",
    icon: UserIcon,
  },
  {
    number: "2",
    title: "Configure sua fazenda",
    description: "Cadastre animais, pastos, currais e defina sua estrutura.",
    icon: FarmIcon,
  },
  {
    number: "3",
    title: "Gerencie com facilidade",
    description: "Acompanhe tudo em um só lugar e tome decisões melhores.",
    icon: BarsIcon,
  },
];

function Landing() {
  const [theme, setTheme] = useState(() => getStoredTheme());
  const isDark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="landing-page min-h-screen bg-[#f7faf4] text-[#082f20]">
      <header className="landing-header sticky top-0 z-40 border-b">
        <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-20 sm:px-6 lg:px-8">
          <Link to="/" className="shrink-0">
            <Logo
              className="h-12 w-40 sm:h-14 sm:w-44"
              imageClassName="h-14 origin-left scale-[2.35] sm:h-16 sm:scale-[2.25]"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-sm font-bold text-white lg:flex">
            <a href="#como-funciona">Como funciona</a>
            <a href="#recursos">Recursos</a>
            <a href="#sobre">Sobre o sistema</a>
            <a href="#contato">Contato</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="landing-top-login">
              Entrar
            </Link>
            <Link to="/register" className="landing-top-cta">
              Criar Conta
            </Link>
            <button
              type="button"
              className="landing-theme-toggle"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              title={isDark ? "Modo claro" : "Modo escuro"}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="landing-hero relative overflow-hidden"
          style={{ backgroundImage: `url(${heroBackground})` }}
        >
          <div className="landing-hero-overlay absolute inset-0" />

          <div className="relative mx-auto grid min-h-[34rem] max-w-7xl items-center gap-10 px-5 py-12 sm:min-h-[41rem] sm:px-6 sm:py-16 lg:grid-cols-[0.98fr_1.02fr] lg:px-8">
            <div className="max-w-2xl">
              <div className="landing-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#6cad3f]" />
                Sistema de gestão rural completo
              </div>

              <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-[-0.055em] text-[#07351f] sm:text-6xl lg:text-[4.55rem]">
                A rotina da fazenda em um sistema simples de controlar
              </h1>

              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-800">
                Organize seus animais, pastos, currais, movimentações e
                aplicações em um só lugar. Mais eficiência, menos planilhas e
                decisões melhores todos os dias.
              </p>

               <p className="mt-9 flex items-center gap-2 text-sm font-medium text-slate-700">
                <LockIcon />
                Acesso ao gerenciador disponível apenas após login.
              </p>

              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link to="/register" className="landing-hero-primary">
                  <UserIcon />
                  Criar Conta
                </Link>
                <Link to="/login" className="landing-hero-secondary">
                  <LoginIcon />
                  Fazer Login
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <img
                src={dashboardPreview}
                alt="Prévia do dashboard AgroControl"
                className="landing-dashboard-preview ml-auto w-full max-w-2xl"
              />
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Como funciona" />

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {steps.map(({ number, title, description, icon: Icon }) => (
              <article key={title} className="landing-step">
                <span className="landing-step-number">{number}</span>
                <span className="landing-step-icon">
                  <Icon />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="relative z-10 mx-auto grid max-w-7xl gap-5 px-5 pb-20 sm:px-6 md:grid-cols-3 lg:px-8">
          {trustCards.map(({ title, description, icon: Icon }) => (
            <article key={title} className="landing-trust-card">
              <span className="landing-trust-icon">
                <Icon />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </section>

        <section id="recursos" className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Recursos principais"
            title="Tudo o que você precisa para uma gestão eficiente"
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {resources.map(({ title, description, icon: Icon }) => (
              <article key={title} className="landing-resource-card">
                <Icon />
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="sobre" className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
          <div className="landing-final-cta">
            <div>
              <h2>Pronto para simplificar a gestão da sua fazenda?</h2>
              <p>
                Crie sua conta ou faça login para acessar o sistema e começar
                agora mesmo.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="landing-cta-light">
                <UserIcon />
                Criar Conta
              </Link>
              <Link to="/login" className="landing-cta-white">
                <LoginIcon />
                Fazer Login
              </Link>
            </div>

            <p className="landing-final-note">
              <LockIcon />
              Acesso ao gerenciador disponível apenas após login.
            </p>
          </div>
        </section>
      </main>

      <footer id="contato" className="landing-new-footer">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr_1fr] lg:px-8">
          <div>
            <Logo
              className="h-12 w-44"
              imageClassName="h-14 origin-left scale-[2.2]"
            />
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/78">
              Sistema de gerenciamento de fazenda com foco em organização,
              clareza operacional e evolução contínua.
            </p>
            <div className="mt-6 flex gap-3">
              <SocialIcon label="f" />
              <SocialIcon label="ig" />
              <SocialIcon label="in" />
            </div>
          </div>

          <FooterColumn title="Sistema" items={["Recursos", "Como funciona", "Segurança", "Perguntas frequentes"]} />
          <FooterColumn title="Módulos" items={["Animais", "Pastos e Currais", "Aplicações", "Relatórios"]} />
          <FooterColumn title="Sobre" items={["Sobre o projeto", "Tecnologias", "Roadmap", "Contato"]} />

          <div>
            <h3>Contato</h3>
            <ul>
              <li>contato@agrocontrol.com.br</li>
              <li>Brasil</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-sm text-white/55">
          © 2026 AgroControl. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? (
        <p className="text-xs font-black uppercase tracking-[0.42em] text-[#16733c]">
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#07351f] sm:text-4xl">
          {title}
        </h2>
      ) : null}
    </div>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ label }) {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-black uppercase text-[#064e3b]">
      {label}
    </span>
  );
}

function IconPath({ path, className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} stroke-current`} fill="none" aria-hidden="true">
      <path d={path} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilledIcon({ path, className = "h-7 w-7" }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} fill-current`} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function UserIcon() {
  return <FilledIcon className="h-5 w-5" path="M12 12.2a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8Zm-7 8.1a7.2 7.2 0 0 1 14 0v.7H5v-.7Z" />;
}

function LoginIcon() {
  return <IconPath className="h-5 w-5" path="M10 6H6.8A1.8 1.8 0 0 0 5 7.8v8.4A1.8 1.8 0 0 0 6.8 18H10M14.5 8.5 18 12m0 0-3.5 3.5M18 12H9" />;
}

function LockIcon() {
  return <IconPath className="h-4 w-4" path="M7 10V7a5 5 0 0 1 10 0v3m-9.2 0h8.4A1.8 1.8 0 0 1 18 11.8v6.4a1.8 1.8 0 0 1-1.8 1.8H7.8A1.8 1.8 0 0 1 6 18.2v-6.4A1.8 1.8 0 0 1 7.8 10Z" />;
}

function ShieldIcon() {
  return <FilledIcon path="M12 2.5 20 5.7v5.9c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V5.7l8-3.2Zm-1.1 12.1 5-5-1.5-1.5-3.5 3.5-1.4-1.4L8 11.7l2.9 2.9Z" />;
}

function ClockIcon() {
  return <FilledIcon path="M12 2.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19Zm1 5h-2v5.2l4.1 2.5 1-1.7-3.1-1.8V7.5Z" />;
}

function ChartIcon() {
  return <FilledIcon path="M4 19h16v2H4v-2Zm2-2h3V9H6v8Zm5 0h3V4h-3v13Zm5 0h3v-6h-3v6Z" />;
}

function AnimalIcon() {
  return <FilledIcon path="M7.2 5.3c1.3-1.9 4-2.7 6.4-1.8 1.5.6 2.7 1.7 3.4 3.2l1.3-.4 1.4 1.2-1.1 1.7.6 2.6-2.3.8-.9 3h-2.1v3H12v-3H9.5l-2.2 1.7H4.8l1.7-2.7-1.7-2.3.9-2.7 3.2-1.8h3.5c-.3-1.1-1.1-1.8-2.2-2.2-1-.3-2.1 0-3 .6Z" />;
}

function GrassIcon() {
  return <IconPath path="M4 19h16M6 17V9m0 8c2.2-4.8 5.2-7.8 9-9m-4 9V7m0 10c1.7-3 3.8-5.2 6.5-6.6m.5 6.6v-6" />;
}

function SyringeIcon() {
  return <IconPath path="m8 4 12 12-4 4L4 8l4-4Zm2 6-3 3m6-6-3 3M4 20h7" />;
}

function MoveIcon() {
  return <IconPath path="M8 7h10m0 0-3-3m3 3-3 3M16 17H6m0 0 3 3m-3-3 3-3" />;
}

function ClipboardIcon() {
  return <FilledIcon path="M8 2.5h8l1.1 2H20a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2.9L8 2.5Zm1.2 4H4v13h16v-13h-5.2l-.7-2h-4.2l-.7 2Z" />;
}

function TeamIcon() {
  return <FilledIcon path="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 10a7 7 0 0 1 14 0H5Zm13-9.5a3 3 0 0 0 0-6v6Zm3 9.5a5.5 5.5 0 0 0-3-4.8V21h3Z" />;
}

function FarmIcon() {
  return <FilledIcon path="M3 19.5h18v2H3v-2Zm2.4-1.4V10l6.6-4.7 6.6 4.7v8.1h-3.1v-4.5h-3v4.5H5.4Z" />;
}

function BarsIcon() {
  return <FilledIcon path="M4 19h16v2H4v-2Zm2-2h3v-5H6v5Zm5 0h3V7h-3v10Zm5 0h3V3h-3v14Z" />;
}

function MoonIcon() {
  return <IconPath className="h-4 w-4" path="M20 14.5A7.5 7.5 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />;
}

function SunIcon() {
  return <IconPath className="h-4 w-4" path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v2m0 14v2m9-9h-2M5 12H3m15.4-6.4L17 7M7 17l-1.4 1.4m0-12.8L7 7m10 10 1.4 1.4" />;
}

export default Landing;
