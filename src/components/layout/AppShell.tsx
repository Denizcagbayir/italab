import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { initSpeech } from '../../lib/speech';
import { useProgress } from '../../store/progressStore';

const NAV = [
  { to: '/', end: true, label: 'Ana', icon: HomeIcon },
  { to: '/path', label: 'Yol', icon: PathIcon },
  { to: '/practice', label: 'Pratik', icon: PracticeIcon },
  { to: '/progress', label: 'İlerleme', icon: ProgressIcon },
  { to: '/settings', label: 'Ayarlar', icon: SettingsIcon },
] as const;

export function AppShell() {
  const hydrateDay = useProgress((s) => s.hydrateDay);
  const xp = useProgress((s) => s.xp);
  const streak = useProgress((s) => s.streak);

  useEffect(() => {
    hydrateDay();
    void initSpeech();
  }, [hydrateDay]);

  return (
    <div className="shell">
      <header className="topbar">
        <NavLink to="/" className="brand" aria-label="ITAlab ana sayfa">
          <span className="brand-mark">ITA</span>
          <span className="brand-name">lab</span>
        </NavLink>
        <div className="top-stats" aria-label="İlerleme özeti">
          <span className="stat-chip" title="Günlük seri">
            <span className="stat-chip-label" aria-hidden>
              Seri
            </span>
            <strong>{streak}</strong>
          </span>
          <span className="stat-chip" title="Toplam XP">
            <span className="stat-chip-label" aria-hidden>
              XP
            </span>
            <strong>{xp}</strong>
          </span>
        </div>
      </header>
      <main className="main" id="main">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Ana menü">
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={'end' in rest ? rest.end : undefined}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
    </svg>
  );
}

function PathIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="12" r="2.5" />
      <circle cx="8" cy="19" r="2.5" />
      <path d="M8 8.5v6.2M10.2 17.2 15.5 13.6" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 5h9a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3V5z" />
      <path d="M8 5V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-1" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}
