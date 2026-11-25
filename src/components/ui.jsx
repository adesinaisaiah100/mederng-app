import { Link } from 'react-router-dom';

const severityLabels = { CRITICAL: 'Critical', URGENT: 'Urgent', ROUTINE: 'Routine' };
const statusLabels = {
  DRAFT: 'Draft', SENT: 'Awaiting response', DELIVERED: 'Delivered', SEEN: 'Under review',
  ACCEPTED: 'Accepted / bed reserved', TRANSFERRED: 'Patient transferred', DECLINED: 'Declined',
  MORE_INFO_REQUESTED: 'Information requested',
};

export function SeverityMark({ severity }) {
  return <span className={`severity-mark severity-${severity?.toLowerCase() || 'routine'}`}>
    <span className="mark-square" aria-hidden="true" />{severityLabels[severity] || severity}
  </span>;
}

export function StatusMark({ status }) {
  return <span className={`status-mark status-${(status || '').toLowerCase()}`}>{statusLabels[status] || status}</span>;
}

export function Elapsed({ from }) {
  if (!from) return <span className="elapsed">—</span>;
  const mins = Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / 60000));
  const label = mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins / 60)}h ${mins % 60}m ago` : `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h ago`;
  return <span className="elapsed">{label}</span>;
}

export function PageHead({ overline, title, sub, actions }) {
  return (
    <header className="page-head">
      <div>
        {overline && <p className="overline">{overline}</p>}
        <h1>{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Panel({ title, children, aside }) {
  return (
    <section className="panel">
      {title && <div className="panel-head"><h2>{title}</h2>{aside}</div>}
      {children}
    </section>
  );
}

export function ReferralCard({ referral, to, direction = 'from', state }) {
  return (
    <Link className={`referral-card ${referral.severity === 'CRITICAL' ? 'is-critical' : ''}`} to={to} state={state}>
      <div className="referral-card-top">
        <SeverityMark severity={referral.severity} />
        <StatusMark status={referral.status} />
        <Elapsed from={referral.created_at} />
      </div>
      <h3>{referral.clinical_summary}</h3>
      <p className="referral-id">{referral.folder_id} <span className="rule-sep"></span> {referral.patient_age}y <span className="rule-sep"></span> {referral.patient_sex === 'M' ? 'Male' : 'Female'} <span className="rule-sep"></span> ID: {referral.ref_number}</p>
      <div className="referral-card-foot">
        <span>{direction === 'to' ? `To: ${referral.to_facility_name || '—'}` : `From: ${referral.from_facility_name || '—'}`}</span>
        <span className="card-view">View</span>
      </div>
    </Link>
  );
}

export function BottomSheet({ label, children }) {
  return (
    <div className="bottom-sheet" role="region" aria-label={label}>
      <span className="sheet-handle" aria-hidden="true" />
      <div className="sheet-content">{children}</div>
    </div>
  );
}

export const STATUS_ORDER = ['DRAFT', 'SENT', 'DELIVERED', 'SEEN', 'ACCEPTED', 'TRANSFERRED'];

export function StatusTrack({ current }) {
  const index = STATUS_ORDER.indexOf(current);
  return (
    <ol className="status-track">
      {STATUS_ORDER.map((s, i) => (
        <li key={s} className={i <= index ? 'is-done' : ''}>
          <span className="track-square" aria-hidden="true" />
          <span>{statusLabels[s]}</span>
        </li>
      ))}
    </ol>
  );
}
