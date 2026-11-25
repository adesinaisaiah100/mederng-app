import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="brand" to="/"><img className="brand-mark" src="/assets/mederng-logo-mark.png" alt="" width="40" height="40" /><span className="brand-text"><span className="brand-name">MedERNg</span><span className="brand-sub">Digital Health Lab</span></span></Link>
        <h1>Sign in to the platform</h1>
        <p className="auth-sub">Email and password access. No verification code required.</p>
        <form onSubmit={submit}>
          <label>Email address<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button-accent button-wide" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
        <p className="auth-foot">New facility clinician? <Link to="/signup">Register a facility account</Link></p>
      </div>
      <aside className="auth-aside">
        <img src="/assets/img/hero-community.jpg" alt="Community medical outreach in Nigeria" />
        <div><p className="overline">Interoperability and referral backbone</p><h2>4-minute digital transfers</h2><p>Turning manual 48-hour hospital handoffs into instant, timestamped emergency referrals across Nigeria.</p><p className="auth-pilot">Figures from the MedERNg Ibadan pilot <span className="rule-sep"></span> v1.0 Pilot</p></div>
      </aside>
    </div>
  );
}

export function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'referrer', facility_id: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/facilities').then(setFacilities).catch(() => {}); }, []);

  function set(key, value) { setForm((f) => ({ ...f, [key]: value })); }

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      await register({ ...form, facility_id: form.facility_id || null });
      navigate('/app');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link className="brand" to="/"><img className="brand-mark" src="/assets/mederng-logo-mark.png" alt="" width="40" height="40" /><span className="brand-text"><span className="brand-name">MedERNg</span><span className="brand-sub">Digital Health Lab</span></span></Link>
        <h1>Register a facility account</h1>
        <p className="auth-sub">Create an account with a work email and password.</p>
        <form onSubmit={submit}>
          <label>Full name<input required value={form.full_name} onChange={(e) => set('full_name', e.target.value)} /></label>
          <label>Email address<input type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" /></label>
          <label>Password<input type="password" required minLength="8" value={form.password} onChange={(e) => set('password', e.target.value)} autoComplete="new-password" /></label>
          <label>Role<select value={form.role} onChange={(e) => set('role', e.target.value)}><option value="referrer">Referring clinician</option><option value="receiving">Receiving clinician</option><option value="admin">Administrator</option></select></label>
          <label>Facility<select required value={form.facility_id} onChange={(e) => set('facility_id', e.target.value)}><option value="">Select a facility</option>{facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button-accent button-wide" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="auth-foot">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
      <aside className="auth-aside">
        <img src="/assets/img/primary-care.jpg" alt="Community healthcare outreach" />
        <div><p className="overline">Clinical staff</p><h2>Referring and receiving</h2><p>One account gives you the right view: send referrals from your facility, or triage incoming transfers at the receiving end.</p></div>
      </aside>
    </div>
  );
}
