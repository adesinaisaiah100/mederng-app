import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth.jsx';
import { SiteLayout, WorkspaceLayout } from './components/Layout.jsx';
import { Home, Protocol, WardResilience, Facilities } from './pages/Public.jsx';
import { Login, Signup } from './pages/Auth.jsx';
import { Feed, Sent, NewReferral, ReferralDetail } from './pages/Workspace.jsx';
import { Simulator } from './pages/Simulator.jsx';

function PublicSimulator() {
  return <div className="content-page"><Simulator /></div>;
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="shell workspace-page"><p className="empty-state">Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/protocol" element={<Protocol />} />
        <Route path="/ward-resilience" element={<WardResilience />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/simulator" element={<PublicSimulator />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Protected><WorkspaceLayout /></Protected>}>
        <Route path="/app" element={<Feed />} />
        <Route path="/app/sent" element={<Sent />} />
        <Route path="/app/new" element={<NewReferral />} />
        <Route path="/app/referrals/:id" element={<ReferralDetail />} />
        <Route path="/app/simulator" element={<Simulator />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
