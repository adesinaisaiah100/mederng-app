import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

function Icon({ name }) {
  const paths = {
    feed: <><path d="M3 5h18v14H3z" /><path d="M3 9h18" /><path d="M7 13h6" /></>,
    sent: <><path d="M21 3 3 10l7 3 3 7z" /><path d="M10 13 21 3" /></>,
    new: <><path d="M12 4v16M4 12h16" /><rect x="3" y="3" width="18" height="18" /></>,
    sim: <><path d="M8 5v14l11-7z" /><rect x="3" y="3" width="18" height="18" /></>,
  };
  return <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true">{paths[name]}</svg>;
}

export function SiteLayout() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="shell header-grid">
          <Link className="brand" to="/" aria-label="MedERNg, home">
            <img className="brand-mark" src="/assets/mederng-logo-mark.png" alt="" width="40" height="40" />
            <span className="brand-text">
              <span className="brand-name">MedERNg</span>
              <span className="brand-sub">Digital Health Lab</span>
            </span>
          </Link>
          <nav id="site-primary-nav" className={`header-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary">
            <NavLink to="/" end onClick={() => setMenuOpen(false)}>Concept note</NavLink>
            <NavLink to="/protocol" onClick={() => setMenuOpen(false)}>Protocol</NavLink>
            <NavLink to="/ward-resilience" onClick={() => setMenuOpen(false)}>Ward resilience</NavLink>
            <NavLink to="/facilities" onClick={() => setMenuOpen(false)}>Facilities</NavLink>
          </nav>
          <div className="header-actions">
            <Link className="text-link text-link-primary" to={user ? '/app' : '/login'}>{user ? 'Open platform' : 'Sign in'}</Link>
            <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-primary-nav" onClick={() => setMenuOpen((v) => !v)}>{menuOpen ? 'Close' : 'Menu'}</button>
          </div>
        </div>
      </header>
      <main id="main"><Outlet /></main>
      <footer className="site-footer">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <img className="brand-mark" src="/assets/mederng-logo-mark.png" alt="" width="36" height="36" />
            <div>
              <p className="footer-name">MedERNg Digital Health Lab</p>
              <p className="footer-tagline">Connecting healthcare facilities. Improving continuity of care.</p>
            </div>
          </div>
          <nav className="footer-nav" aria-label="Footer">
            <Link to="/">Concept note</Link>
            <Link to="/protocol">Referral protocol</Link>
            <Link to="/facilities">Facilities</Link>
            <Link to="/simulator">Live simulator</Link>
          </nav>
          <div className="footer-meta">
            <p>www.mederng.com <span className="rule-sep"></span> admin@mederng.com</p>
            <p>Photography: mk_photoz, Denis Ngai, Ninthgrid, Speak Media Uganda / XiGe-STUDIO via Pexels</p>
            <p>MedERNg. Concept note submitted to the Oyo State Government.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function WorkspaceLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="workspace-shell">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="workspace-header">
        <div className="shell workspace-header-grid">
          <Link className="workspace-brand" to="/app">
            <img className="workspace-mark" src="/assets/mederng-logo-mark.png" alt="" width="36" height="36" />
            <span>
              <strong>MedERNg</strong>
              <small>Clinical Staff (Referring &amp; Receiving)</small>
            </span>
            <span className="workspace-facility">{user?.facility_name || 'No facility assigned'}</span>
          </Link>
          <div className="workspace-actions">
            <span className="workspace-hospital">Hospital: {user?.facility_name || '—'}</span>
            <Link className="button-accent" to="/app/new">New Referral</Link>
            <Link className="workspace-avatar" to="/app" aria-label="Account">{(user?.full_name || 'U').slice(0, 1).toUpperCase()}</Link>
            <button className="workspace-logout" type="button" onClick={signOut} aria-label="Sign out">Exit</button>
          </div>
        </div>
        <div className="shell workspace-subnav">
          <NavLink to="/app" end>Incoming Triage Feed</NavLink>
          <NavLink to="/app/sent">Sent Patient Transfers</NavLink>
          <NavLink to="/app/simulator">Live Simulator</NavLink>
          <span className="workspace-working">Working at: {user?.facility_name || '—'}</span>
        </div>
      </header>
      <main className="workspace-main" id="main"><Outlet /></main>
      <nav className="mobile-tabbar" aria-label="Workspace">
        <NavLink to="/app" end className="mobile-tab"><Icon name="feed" /><span>Feed</span></NavLink>
        <NavLink to="/app/sent" className="mobile-tab"><Icon name="sent" /><span>Sent</span></NavLink>
        <NavLink to="/app/new" className="mobile-tab"><Icon name="new" /><span>New</span></NavLink>
        <NavLink to="/app/simulator" className="mobile-tab"><Icon name="sim" /><span>Demo</span></NavLink>
      </nav>
    </div>
  );
}
