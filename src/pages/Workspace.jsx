import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { BottomSheet, Elapsed, PageHead, Panel, ReferralCard, SeverityMark, StatusMark, StatusTrack } from '../components/ui.jsx';

const urgencyFilters = ['ALL', 'CRITICAL', 'URGENT', 'ROUTINE'];
const sentFilters = [['ALL', 'All'], ['ACTIVE', 'Active'], ['ACCEPTED', 'Accepted'], ['COMPLETED', 'Completed']];

export function Feed() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [urgency, setUrgency] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/referrals?view=received').then(setRows).catch((e) => setError(e.message));
  }, []);

  const visible = useMemo(() => rows.filter((r) =>
    (urgency === 'ALL' || r.severity === urgency) &&
    (!search || `${r.clinical_summary} ${r.folder_id} ${r.ref_number} ${r.from_facility_name}`.toLowerCase().includes(search.toLowerCase()))
  ), [rows, urgency, search]);

  const needing = rows.filter((r) => r.status === 'SENT' || r.status === 'DELIVERED').length;

  return (
    <div className="shell workspace-page">
      <PageHead overline="Receiving station" title="Incoming Emergency Triage Feed" sub={`Receiving triage station: ${user?.facility_name || '—'}`}
        actions={needing ? <span className="attention-mark">{needing} needing triage attention</span> : null} />
      {error && <p className="form-error" role="alert">{error}</p>}
      <Panel>
        <div className="filter-bar">
          <div className="filter-group"><span className="filter-label">Urgency</span>
            {urgencyFilters.map((u) => <button key={u} type="button" className={`filter-btn ${urgency === u ? 'is-active' : ''}`} aria-pressed={urgency === u} onClick={() => setUrgency(u)}>{u === 'ALL' ? 'All' : u}</button>)}
          </div>
          <input className="search-input" type="search" placeholder="Search patient, ID, hospital" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search referrals" />
        </div>
        <div className="referral-list">
          {visible.length === 0 && <p className="empty-state">No referrals match this view.</p>}
          {visible.map((r) => <ReferralCard key={r.id} referral={r} to={`/app/referrals/${r.id}`} />)}
        </div>
      </Panel>
    </div>
  );
}

export function Sent() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api('/referrals?view=sent').then(setRows).catch((e) => setError(e.message)); }, []);

  const visible = useMemo(() => rows.filter((r) => {
    const matchesTab = tab === 'ALL' || (tab === 'ACTIVE' && ['SENT', 'DELIVERED', 'SEEN'].includes(r.status)) || (tab === 'ACCEPTED' && r.status === 'ACCEPTED') || (tab === 'COMPLETED' && r.status === 'TRANSFERRED');
    return matchesTab && (!search || `${r.clinical_summary} ${r.folder_id} ${r.to_facility_name}`.toLowerCase().includes(search.toLowerCase()));
  }), [rows, tab, search]);

  return (
    <div className="shell workspace-page">
      <PageHead overline="Referring facility" title="My Sent Patient Referrals" sub={`Referring facility: ${user?.facility_name || '—'}`}
        actions={<><span className="attention-mark">{rows.filter((r) => ['SENT', 'DELIVERED', 'SEEN'].includes(r.status)).length} active handoffs</span><Link className="button-accent" to="/app/new">New Referral</Link></>} />
      <Panel>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="filter-bar" role="tablist" aria-label="Referral status">
          <div className="filter-group">{sentFilters.map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={tab === key} className={`filter-btn ${tab === key ? 'is-active' : ''}`} onClick={() => setTab(key)}>{label}</button>)}</div>
          <input className="search-input" type="search" placeholder="Search sent referrals" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search sent referrals" />
        </div>
        <div className="referral-list">
          {visible.length === 0 && <p className="empty-state">{error ? 'Referrals could not be loaded.' : 'No sent referrals match this view.'}</p>}
          {visible.map((r) => <ReferralCard key={r.id} referral={r} to={`/app/referrals/${r.id}`} direction="to" state={{ from: 'sent' }} />)}
        </div>
      </Panel>
    </div>
  );
}

const blankDraft = { folder_id: '', patient_age: '', patient_sex: 'Female', contact: '', clinical_summary: '', severity: '', to_facility_id: '', bp_systolic: '', bp_diastolic: '', heart_rate: '', temperature: '', spo2: '' };
const DRAFT_KEY = 'mederng-referral-draft';

export function NewReferral() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [draft, setDraft] = useState(() => {
    try { return { ...blankDraft, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') }; } catch { return blankDraft; }
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    api('/facilities').then((all) => setFacilities(all.filter((f) => f.id !== user?.facility_id))).catch(() => {});
  }, [user?.facility_id]);

  useEffect(() => {
    const t = setTimeout(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); setSavedAt(new Date()); }, 400);
    return () => clearTimeout(t);
  }, [draft]);

  function set(key, value) { setDraft((d) => ({ ...d, [key]: value })); }

  async function submit(e) {
    e.preventDefault(); setError('');
    if (!draft.severity) { setError('Select an urgency level before transmitting'); return; }
    setBusy(true);
    try {
      const created = await api('/referrals', { method: 'POST', body: JSON.stringify({
        folder_id: draft.folder_id.trim(), to_facility_id: draft.to_facility_id,
        patient_age: Number(draft.patient_age) || null,
        patient_sex: draft.patient_sex === 'Male' ? 'M' : 'F',
        severity: draft.severity, clinical_summary: draft.clinical_summary.trim(),
        vitals: {
          contact: draft.contact,
          bp: draft.bp_systolic && draft.bp_diastolic ? `${draft.bp_systolic}/${draft.bp_diastolic} mmHg` : '',
          heart_rate: draft.heart_rate ? `${draft.heart_rate} bpm` : '',
          temperature: draft.temperature ? `${draft.temperature} °C` : '',
          spo2: draft.spo2 ? `${draft.spo2}%` : '',
        },
      }) });
      localStorage.removeItem(DRAFT_KEY);
      navigate(`/app/referrals/${created.id}`);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="shell workspace-page form-page">
      <PageHead overline="New handoff" title="New Patient Referral" sub={`From: ${user?.facility_name || '—'}`}
        actions={savedAt ? <span className="saved-mark">Saved locally <Elapsed from={savedAt.toISOString()} /></span> : null} />
      <form onSubmit={submit} className="referral-form">
        <Panel title="1. Patient identification">
          <div className="field-grid">
            <label>Patient identifier / folder number<input required placeholder="e.g. PAT-M-1942" value={draft.folder_id} onChange={(e) => set('folder_id', e.target.value)} /></label>
            <label>Age (years)<input type="number" min="0" max="120" placeholder="34" value={draft.patient_age} onChange={(e) => set('patient_age', e.target.value)} /></label>
            <label>Sex<select value={draft.patient_sex} onChange={(e) => set('patient_sex', e.target.value)}><option>Female</option><option>Male</option></select></label>
          </div>
          <label>Patient / next-of-kin contact phone (optional)<input type="tel" placeholder="+234 803 XXX XXXX" value={draft.contact} onChange={(e) => set('contact', e.target.value)} /></label>
        </Panel>

        <Panel title="2. Observations at referral">
          <div className="field-grid">
            <label>Systolic BP<input type="number" min="50" max="300" placeholder="120" value={draft.bp_systolic} onChange={(e) => set('bp_systolic', e.target.value)} /></label>
            <label>Diastolic BP<input type="number" min="30" max="200" placeholder="80" value={draft.bp_diastolic} onChange={(e) => set('bp_diastolic', e.target.value)} /></label>
            <label>Heart rate<input type="number" min="20" max="250" placeholder="72" value={draft.heart_rate} onChange={(e) => set('heart_rate', e.target.value)} /></label>
          </div>
          <div className="field-grid">
            <label>Temperature (°C)<input type="number" step="0.1" min="30" max="45" placeholder="36.8" value={draft.temperature} onChange={(e) => set('temperature', e.target.value)} /></label>
            <label>Oxygen saturation (%)<input type="number" min="50" max="100" placeholder="98" value={draft.spo2} onChange={(e) => set('spo2', e.target.value)} /></label>
          </div>
        </Panel>

        <Panel title="3. Reason for referral" aside={<span className="char-count">{draft.clinical_summary.length} chars</span>}>
          <label className="visually-hidden" htmlFor="clinical-summary">Clinical reason for referral</label>
          <textarea id="clinical-summary" required rows="6" value={draft.clinical_summary} onChange={(e) => set('clinical_summary', e.target.value)}
            placeholder="Describe the clinical presentation, vital signs, primary diagnosis and required care (e.g. 34yo G2P1 at 38wks gestation with severe pre-eclampsia BP 175/110 mmHg, requiring urgent ICU bed and emergency C-section…)" />
        </Panel>

        <Panel title="3. Referral urgency level">
          <div className="severity-options">
            {[
              ['ROUTINE', 'Elective transfer, non-life-threatening condition.'],
              ['URGENT', 'Requires clinical response within 1–2 hours.'],
              ['CRITICAL', 'Immediate life threat, requires a rapid handoff response.'],
            ].map(([sev, desc]) => (
              <button type="button" key={sev} className={`severity-option ${draft.severity === sev ? 'is-selected' : ''}`} aria-pressed={draft.severity === sev} onClick={() => set('severity', sev)}>
                <SeverityMark severity={sev} /><span>{desc}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="4. Destination receiving hospital" aside={<span className="required-mark">Required</span>}>
          <label className="visually-hidden" htmlFor="destination">Destination facility</label>
          <select id="destination" required value={draft.to_facility_id} onChange={(e) => set('to_facility_id', e.target.value)}>
            <option value="">Select a receiving facility</option>
            {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}{f.lga ? ` — ${f.lga}` : ''}</option>)}
          </select>
          <p className="field-note">Only registered destination facilities are selectable. Referrals cannot be routed to your own facility.</p>
        </Panel>

        {error && <p className="form-error" role="alert">{error}</p>}
        <BottomSheet label="Referral actions"><div className="form-actions"><Link className="text-link" to="/app">Cancel</Link><button className="button-accent" type="submit" disabled={busy}>{busy ? 'Transmitting…' : 'Transmit referral now'}</button></div></BottomSheet>
      </form>
    </div>
  );
}

export function ReferralDetail() {
  const { id } = useParams();
  const location = useLocation();
  const backTo = location.state?.from === 'sent' ? '/app/sent' : '/app';
  const { user } = useAuth();
  const [r, setR] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [bed, setBed] = useState('');
  const [error, setError] = useState('');

  function load() {
    api(`/referrals/${id}`).then((data) => { setR(data); setMessages(data.messages || []); }).catch((e) => setError(e.message));
  }
  useEffect(load, [id]);

  async function act(path, body, note) {
    setError('');
    try {
      await api(`/referrals/${id}/${path}`, { method: 'POST', body: JSON.stringify(body || {}) });
      if (note) setMessage('');
      load();
    } catch (e) { setError(e.message); }
  }

  if (error && !r) return <div className="shell workspace-page"><p className="form-error" role="alert">{error}</p></div>;
  if (!r) return <div className="shell workspace-page"><p className="empty-state">Loading referral…</p></div>;

  const isReceiving = r.to_facility_id === user?.facility_id || user?.role === 'admin';
  const vitals = r.vitals || {};
  const next = {
    SENT: ['DELIVERED', 'Mark delivered', 'Referral delivered to receiving team'],
    DELIVERED: ['SEEN', 'Mark seen', 'Detail sheet opened by receiving clinician'],
    SEEN: ['ACCEPTED', 'Accept and reserve bed', 'Bed reserved'],
  }[r.status];

  return (
    <div className="shell workspace-page detail-page">
      <Link className="back-link" to={backTo}>{backTo === '/app/sent' ? 'Back to sent referrals' : 'Back to incoming feed'}</Link>
      <PageHead overline={`Reference ${r.ref_number}`} title={r.clinical_summary}
        actions={<><SeverityMark severity={r.severity} /><StatusMark status={r.status} /></>} />

      <div className="detail-grid">
        <Panel title="Patient details">
          <dl className="detail-list"><dt>Folder ID</dt><dd>{r.patient_initials}</dd><dt>Age</dt><dd>{r.patient_age || '—'} years</dd><dt>Sex</dt><dd>{r.patient_sex === 'M' ? 'Male' : 'Female'}</dd>{vitals.contact && <><dt>Contact</dt><dd>{vitals.contact}</dd></>}</dl>
        </Panel>
        <Panel title="Transfer route">
          <dl className="detail-list"><dt>From</dt><dd>{r.from_facility_name}</dd><dt>To</dt><dd>{r.to_facility_name}</dd><dt>Initiated</dt><dd>{new Date(r.created_at).toLocaleString()}</dd>{r.bed_assignment && <><dt>Bed</dt><dd>{r.bed_assignment}</dd></>}</dl>
        </Panel>
      </div>

      <Panel title="Referral progression"><StatusTrack current={r.status} /></Panel>

      <Panel title="Timestamped audit trail">
        <ol className="audit-list">
          {r.events?.map((e) => <li key={e.id}>
            <span className="track-square" aria-hidden="true" />
            <div><StatusMark status={e.status} /><p>{e.note || 'Status updated'}</p><p className="audit-meta">{e.actor_name || 'Clinician'}{e.actor_facility ? ` / ${e.actor_facility}` : ''} <span className="rule-sep"></span> {new Date(e.created_at).toLocaleString()}</p></div>
          </li>)}
        </ol>
      </Panel>

      <Panel title="Clinical communication">
        <div className="message-list">
          {messages.length === 0 && <p className="empty-state">No messages yet. Request information or send a note.</p>}
          {messages.map((m) => <div className="message" key={m.id}><p>{m.body}</p><span>{m.sender_id === user?.id ? 'You' : (m.sender_name || 'Facility')} <span className="rule-sep"></span> {new Date(m.created_at).toLocaleString()}</span></div>)}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <form className="message-form" onSubmit={(e) => { e.preventDefault(); act('messages', { body: message }, true); }}>
          <label className="visually-hidden" htmlFor="message">Message</label>
          <input id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write a clinical note or request details" />
          <button type="submit">Send</button>
        </form>
      </Panel>

      <BottomSheet label="Referral actions">
        <div className="detail-actions">
          {isReceiving && <button type="button" className="button-quiet" onClick={() => act('request-info', { note: 'Additional clinical information requested' })}>Request info</button>}
          {isReceiving && next && <>
            <button type="button" className="button-quiet" onClick={() => act('status', { status: 'DECLINED', note: 'Referral declined' })}>Decline referral</button>
            {next[0] === 'ACCEPTED' && <label className="bed-field">Bed assignment<input value={bed} onChange={(e) => setBed(e.target.value)} placeholder="e.g. HDU-03" /></label>}
            <button type="button" className="button-accent" onClick={() => act('status', { status: next[0], note: next[2], bed_assignment: next[0] === 'ACCEPTED' ? bed : undefined })}>{next[1]}</button>
          </>}
          {isReceiving && r.status === 'ACCEPTED' && <button type="button" className="button-accent" onClick={() => act('status', { status: 'TRANSFERRED', note: 'Patient admitted' })}>Confirm transfer</button>}
        </div>
      </BottomSheet>
    </div>
  );
}
