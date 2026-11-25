import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHead, Panel, SeverityMark, StatusMark } from '../components/ui.jsx';

const scenarios = [
  {
    id: 'pre-eclampsia', label: 'Pre-eclampsia', severity: 'CRITICAL',
    patient: 'Folashade A., 28F', from: 'Adeoyo Maternity Teaching Hospital', to: 'University College Hospital, Ibadan',
    detail: 'G2P1 at 34wks. BP 175/115 mmHg, 3+ proteinuria, persistent epigastric pain, impending eclampsia.',
    bed: 'Obstetric High Dependency Unit (HDU-03)',
  },
  {
    id: 'trauma', label: 'Trauma GCS 8', severity: 'CRITICAL',
    patient: 'Male patient, 31', from: 'General Hospital, Ibadan', to: 'Federal Medical Centre Ebuta Metta (FMC)',
    detail: 'Road traffic accident, GCS 8, suspected polytrauma. Requires trauma bay and cross-matched blood.',
    bed: 'Trauma Bay 02',
  },
  {
    id: 'stemi', label: 'Acute STEMI', severity: 'CRITICAL',
    patient: 'Female patient, 56', from: 'Primary Health Centre, Ibadan North', to: 'University College Hospital, Ibadan',
    detail: 'Acute chest pain, ST elevation on ECG. Requires urgent catheterisation laboratory.',
    bed: 'Cardiac Care Unit (CCU-01)',
  },
];

const timeline = [
  ['SENT', 'Transmitted from ward', 0],
  ['DELIVERED', 'Casualty push alert', 14],
  ['SEEN', 'Consultant opened record', 82],
  ['ACCEPTED', 'Bed assigned and locked', 228],
];

export function Simulator() {
  const [scenario, setScenario] = useState(scenarios[0]);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const timer = useRef(null);

  useEffect(() => {
    if (!running || reducedMotion) return;
    timer.current = setInterval(() => {
      setElapsed((v) => {
        if (v >= 248) { setRunning(false); return 248; }
        return v + 1;
      });
    }, 1000);
    return () => clearInterval(timer.current);
  }, [running]);

  const reached = timeline.filter(([, , second]) => elapsed >= second);
  const confirmed = elapsed >= 228;

  function run() { setElapsed(0); setRunning(!reducedMotion); }
  function reset() { setRunning(false); setElapsed(0); }
  function step() { setElapsed((v) => Math.min(248, v + 1)); }

  return (
    <div className="shell workspace-page simulator-page">
      <PageHead overline="Layer 05 / interactive demo" title="Experience a transfer in real time"
        sub="Select a clinical scenario and watch the state progression from dispatch to bed lock." />
      <Panel>
        <div className="filter-bar">
          <div className="filter-group"><span className="filter-label">Scenario</span>
            {scenarios.map((s) => <button key={s.id} type="button" className={`filter-btn ${scenario.id === s.id ? 'is-active' : ''}`} onClick={() => { setScenario(s); reset(); }}>{s.label}</button>)}
          </div>
          <span className="sim-clock">T + {String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</span>
        </div>
        <div className="sim-case">
          <div><strong>{scenario.patient}</strong> <SeverityMark severity={scenario.severity} /></div>
          <p>From: {scenario.from} <span className="rule-sep"></span> To: {scenario.to}</p>
          <p>{scenario.detail}</p>
        </div>
        <ol className="sim-timeline">
          {timeline.map(([status, note, second]) => {
            const done = elapsed >= second;
            return <li key={status} className={done ? 'is-done' : ''}>
              <span className="track-square" aria-hidden="true" />
              <span className="sim-time">T + {String(Math.floor(second / 60)).padStart(2, '0')}:{String(second % 60).padStart(2, '0')}</span>
              <div><StatusMark status={status} /><p>{note}</p></div>
            </li>;
          })}
        </ol>
        {confirmed && <div className="sim-confirmed">Transfer confirmed <span className="rule-sep"></span> {scenario.to} accepted patient <span className="rule-sep"></span> Reserved bed: {scenario.bed}</div>}
        <p className="sim-foot">Figures from the MedERNg Ibadan pilot <span className="rule-sep"></span> Illustrative simulation with synthetic data</p>
        <div className="form-actions">{reducedMotion && <button type="button" className="button-quiet" onClick={step}>Next step</button>}<button type="button" className="button-accent" onClick={run}>Run transfer simulation</button><button type="button" className="button-quiet" onClick={reset}>Reset</button><Link className="text-link" to="/app">Back to feed</Link></div>
      </Panel>
    </div>
  );
}
