import { NavLink, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { initSpeech } from '../../lib/speech';
import { useProgress } from '../../store/progressStore';

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
        <NavLink to="/" className="brand">
          <span className="brand-mark">ITA</span>
          <span className="brand-name">lab</span>
        </NavLink>
        <div className="top-stats">
          <span title="Seri">🔥 {streak}</span>
          <span title="XP">✨ {xp}</span>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        <NavLink to="/" end>
          Ana
        </NavLink>
        <NavLink to="/path">Yol</NavLink>
        <NavLink to="/practice">Pratik</NavLink>
        <NavLink to="/progress">İlerleme</NavLink>
        <NavLink to="/settings">Ayarlar</NavLink>
      </nav>
    </div>
  );
}
