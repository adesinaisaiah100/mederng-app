import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHead, Panel, SeverityMark } from '../components/ui.jsx';

const scenarios = [
  {
    id: 'pre-eclampsia', label: 'Pre-eclampsia', severity: 'CRITICAL',
    ref: 'REF-2026-217655', patient: 'Folashade A.', age: '28y', sex: 'Female',
    from: 'Adeoyo Maternity Teaching Hospital', to: 'University College Hospital, Ibadan',
    detail: 'G2P1 at 34 weeks. BP 175/115 mmHg, 3+ proteinuria, persistent epigastric pain, impending eclampsia.',
    observations: [['BP', '175/115 mmHg'], ['Proteinuria', '3+'], ['Gestation', '34 weeks'], ['Gravida', 'G2P1']],
    bed: 'Obstetric High Dependency Unit (HDU-03)',
  },
  {
    id: 'trauma', label: 'Trauma GCS 8', severity: 'CRITICAL',
    ref: 'REF-2026-819197', patient: 'Male patient', age: '31y', sex: 'Male',
    from: 'Primary Health Centre, Ibadan North', to: 'Primary Health Centre, Ibadan South East',
    detail: 'Road traffic accident, GCS 8, suspected polytrauma. Requires trauma bay and cross-matched blood.',
    observations: [['GCS', '8'], ['BP', '90/60 mmHg'], ['Heart rate', '122 bpm'], ['SpO₂', '91%']],
    bed: 'Trauma Bay 02',
  },
  {
    id: 'stemi', label: 'Acute STEMI', severity: 'CRITICAL',
    ref: 'REF-2026-440218', patient: 'Female patient', age: '56y', sex: 'Female',
    from: 'General Hospital, Ibadan', to: 'University College Hospital, Ibadan',
    detail: 'Acute chest pain with ST elevation on ECG. Requires urgent catheterisation laboratory.',
    observations: [['ECG', 'ST elevation'], ['BP', '148/94 mmHg'], ['Heart rate', '108 bpm'], ['SpO₂', '95%']],
    bed: 'Cardiac Care Unit (CCU-01)',
  },
];

const timeline = [
  ['SENT', 'Transmitted from ward', 0],
  ['DELIVERED', 'Casualty push alert', 14],
  ['SEEN', 'Consultant opened record', 82],
  ['ACCEPTED', 'Bed assigned and locked', 228],
];

const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
const shortStatus = { SENT: 'Sent', DELIVERED: 'Delivered', SEEN: 'Seen', ACCEPTED: 'Accepted' };

export function Simulator() {
  const [scenario, setScenario] = useState(scenarios[0]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timer = useRef(null);

  useEffect(() => {
    if (!running || reducedMotion) return;
    timer.current = setInterval(() => setElapsed((v) => (v >= 248 ? (setRunning(false), 248) : v + 1)), 1000);
    return () => clearInterval(timer.current);
  }, [running, reducedMotion]);

  const confirmed = elapsed >= 228;
  const progress = Math.min(100, (elapsed / 248) * 100);

  function run() { setElapsed(0); setRunning(!reducedMotion); }
  function reset() { setRunning(false); setElapsed(0); }
  function step() { setElapsed((v) => Math.min(248, v + 1)); }

  return (
    <div className="shell workspace-page simulator-page">
      <PageHead overline="Layer 05 / interactive demo"
        title="Experience a transfer in real time"
        sub="Select a clinical scenario and watch the handoff move from dispatch to bed lock." />

      <div className="sim-layout">
        <section className="sim-main">
          <Panel>
            <div className="filter-bar">
              <div className="filter-group"><span className="filter-label">Scenario</span>
                {scenarios.map((s) => <button key={s.id} type="button" className={`filter-btn ${scenario.id === s.id ? 'is-active' : ''}`} aria-pressed={scenario.id === s.id} onClick={() => { setScenario(s); reset(); }}>{s.label}</button>)}
              </div>
              <span className="sim-clock">T + {clock(elapsed)}</span>
            </div>
            <div className="sim-progress" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

            <article className="sim-case">
              <div className="sim-case-head">
                <div>
                  <h2>{scenario.patient}</h2>
                  <p className="sim-case-meta">{scenario.age} <span className="rule-sep"></span> {scenario.sex} <span className="rule-sep"></span> {scenario.ref}</p>
                </div>
                <SeverityMark severity={scenario.severity} />
              </div>
              <p className="sim-route"><span>From</span>{scenario.from}</p>
              <p className="sim-route"><span>To</span>{scenario.to}</p>
              <p className="sim-detail">{scenario.detail}</p>
              <dl className="sim-observations">
                {scenario.observations.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
              </dl>
            </article>

            <div className="sim-section-label">Live audit progression</div>
            <ol className="sim-steps">
              {timeline.map(([status, note, second]) => {
                const done = elapsed >= second;
                return <li key={status} className={done ? 'is-done' : ''}>
                  <span className="sim-step-marker" aria-hidden="true" />
                  <span className="sim-step-time">T + {clock(second)}</span>
                  <span className="status-mark">{shortStatus[status] || status}</span>
                  <p className="sim-step-note">{note}</p>
                  {done && <p className="sim-step-audit">Audit event recorded</p>}
                </li>;
              })}
            </ol>

            {confirmed && <div className="sim-confirmed">
              <strong>Emergency transfer confirmed</strong>
              <p>{scenario.to} accepted the patient <span className="rule-sep"></span> Reserved bed: {scenario.bed}</p>
              <p>Total time: 3m 48s</p>
            </div>}
          </Panel>
        </section>

        <aside className="sim-side">
          <Panel title="Pilot figures">
            <div className="sim-stat"><strong>4m 12s</strong><span>Average triage response</span></div>
            <div className="sim-stat"><strong>100%</strong><span>Timestamped audit trail</span></div>
            <div className="sim-stat"><strong>&lt; 50 KB</strong><span>Ultra-lightweight 3G payload</span></div>
            <p className="sim-foot">Figures from the MedERNg Ibadan pilot <span className="rule-sep"></span> Illustrative simulation with synthetic data</p>
          </Panel>
          <Panel title="Run the demo">
            <p className="sim-help">Each step is timestamped as the referral moves through the receiving team. Run it once, then switch scenarios to compare.</p>
            <div className="form-actions sim-actions">
              {reducedMotion && <button type="button" className="button-quiet" onClick={step}>Next step</button>}
              <button type="button" className="button-accent" onClick={run}>{running ? 'Restart simulation' : 'Run transfer simulation'}</button>
              <button type="button" className="button-quiet" onClick={reset}>Reset</button>
            </div>
            <Link className="text-link" to="/app">Open the triage feed</Link>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
