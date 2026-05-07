import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getUserProfile } from "../utils/userProfile";

const SHOW_ENVIRONMENT_CARD = !import.meta.env.PROD;

function Header({ title, description, onOpenSidebar }) {
  const profile = getUserProfile();
  const calendarRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const today = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(calendarMonth);

  useEffect(() => {
    if (!isCalendarOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!calendarRef.current?.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCalendarOpen]);

  function changeCalendarMonth(delta) {
    setCalendarMonth((current) => {
      const next = new Date(current);
      next.setMonth(current.getMonth() + delta, 1);
      return next;
    });
  }

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[var(--color-surface)]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[120rem] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="ag-button-secondary inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border shadow-sm sm:h-11 sm:w-11 lg:hidden"
            aria-label="Abrir menu"
          >
            <MenuIcon />
          </button>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
              AgroControl
            </p>
            <h1 className="truncate text-2xl font-black tracking-[-0.04em] text-[var(--color-text-strong)] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-1 hidden max-w-2xl text-sm leading-5 text-[var(--color-text-muted)] sm:block">
              {description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {SHOW_ENVIRONMENT_CARD ? (
            <HeaderInfoCard
              className="hidden xl:flex"
              eyebrow="Ambiente"
              value="API local conectada"
              icon={<StatusDotIcon />}
            />
          ) : null}

          <div ref={calendarRef} className="relative hidden md:block">
            <button
              type="button"
              className="header-info-card flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-left transition hover:bg-[var(--color-surface-hover)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus)]"
              onClick={() => setIsCalendarOpen((value) => !value)}
              aria-expanded={isCalendarOpen}
              aria-label="Abrir calendário"
            >
              <span className="text-[var(--color-primary)]">
                <CalendarIcon />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                  Hoje
                </p>
                <p className="mt-0.5 whitespace-nowrap text-sm font-bold text-[var(--color-primary)]">
                  {today}
                </p>
              </div>
            </button>

            {isCalendarOpen ? (
              <div className="calendar-popover absolute right-0 top-full z-50 mt-3 w-80 rounded-2xl border p-4 shadow-xl">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="calendar-nav-button"
                    onClick={() => changeCalendarMonth(-1)}
                    aria-label="Mês anterior"
                  >
                    ‹
                  </button>
                  <p className="text-center text-base font-black capitalize text-[var(--color-text-strong)]">
                    {monthLabel}
                  </p>
                  <button
                    type="button"
                    className="calendar-nav-button"
                    onClick={() => changeCalendarMonth(1)}
                    aria-label="Próximo mês"
                  >
                    ›
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                  {["dom", "seg", "ter", "qua", "qui", "sex", "sáb"].map((day) => (
                    <span
                      key={day}
                      className="py-1 text-[0.68rem] font-bold uppercase tracking-wide text-[var(--color-text-muted)]"
                    >
                      {day}
                    </span>
                  ))}

                  {calendarDays.map((day) => (
                    <span
                      key={day.key}
                      className={`calendar-day ${day.isCurrentMonth ? "" : "calendar-day-muted"} ${
                        day.isToday ? "calendar-day-today" : ""
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <Link
            to="/perfil"
            className="header-info-card inline-flex min-h-11 items-center gap-2 rounded-xl border px-2 py-1.5 transition hover:bg-[var(--color-surface-hover)] sm:min-h-13 sm:gap-3 sm:px-4 sm:py-2"
            aria-label="Abrir perfil"
          >
            <div className="hidden min-w-0 text-right sm:block">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                Perfil
              </p>
              <p className="mt-1 max-w-32 truncate text-base font-bold text-[var(--color-primary)]">
                {profile.nome}
              </p>
            </div>
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-primary)] sm:h-10 sm:w-10">
              <UserIcon />
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeaderInfoCard({ eyebrow, value, icon, className = "" }) {
  return (
    <div className={`header-info-card min-h-13 items-center gap-3 rounded-xl border px-4 py-2 ${className}`}>
      <span className="text-[var(--color-primary)]">{icon}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
          {eyebrow}
        </p>
        <p className="mt-0.5 whitespace-nowrap text-sm font-bold text-[var(--color-primary)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function buildCalendarDays(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  const today = new Date();
  const todayKey = toDateKey(today);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);

    return {
      date,
      key: toDateKey(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: toDateKey(date) === todayKey,
    };
  });
}

function toDateKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6 fill-current"
      aria-hidden="true"
    >
      <path d="M12 12.2a4.6 4.6 0 1 0 0-9.2 4.6 4.6 0 0 0 0 9.2Zm-8 8.1a8.1 8.1 0 0 1 16 0v.7H4v-.7Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 stroke-current" fill="none" aria-hidden="true">
      <path d="M7 3v4M17 3v4M4 9h16M5.5 5.5h13A1.5 1.5 0 0 1 20 7v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V7a1.5 1.5 0 0 1 1.5-1.5Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusDotIcon() {
  return (
    <span className="inline-flex h-3 w-3 rounded-full bg-[var(--color-primary)] shadow-[0_0_0_5px_rgba(4,120,87,0.12)]" />
  );
}

export default Header;
