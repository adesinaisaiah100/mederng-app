import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../api.js';

const problems = [
  ['No longitudinal record', 'Paper and fragmented files make it difficult to keep a patient’s full history, monitor care, or produce reliable health data.'],
  ['No secure handover', 'When a patient moves to a higher level of care, their history, investigations and medicines do not travel with them in a usable form.'],
  ['No reliable planning data', 'Without structured records, continuity weakens, decisions are delayed, and planning lacks an evidence base.'],
];

const capabilities = [
  ['Comprehensive electronic records', 'Unique patient identification, medical, surgical, family and social histories, consultations, diagnoses, medicines, immunisations, laboratory results, imaging reports, and antenatal, maternal, newborn and child health records.'],
  ['Facility-to-facility referrals', 'A primary healthcare centre can initiate a digital referral to a secondary or tertiary institution, including Adeoyo Maternity Hospital, Ibadan. The receiving facility sees authorised referral information and documents the care that follows.'],
  ['AI-assisted risk stratification', 'Analysis of patient information and clinically validated risk indicators flags patients who may need urgent assessment or escalation. Alerts support clinicians; final decisions remain with qualified professionals.'],
  ['Patient information and continuity', 'Appointment reminders, follow-up notifications and care instructions through SMS and other accessible channels, with patient access to their own medical information.'],
];

const phases = [
  ['Phase 01', 'Stakeholder engagement and integration planning', 'Establish a technical working group, identify participating facilities, assess infrastructure, and agree data governance and interoperability requirements.'],
  ['Phase 02', 'EMR deployment and facility onboarding', 'Deploy in selected PHCs, digitise registration and documentation, train health workers, and establish secure records management.'],
  ['Phase 03', 'Inter-facility connectivity and referral integration', 'Connect PHCs to referral facilities, activate digital referrals and authorised access, introduce tracking, then evaluate and improve.'],
  ['Phase 04', 'Expansion, analytics and clinical decision support', 'Expand to more facilities, introduce validated AI-assisted risk stratification, strengthen follow-up, and build aggregated dashboards.'],
];

const outcomes = [
  'Better digital records management and access across facilities',
  'Stronger coordination between primary, secondary and tertiary care',
  'Fewer delays caused by incomplete information and manual referrals',
  'Continuity through structured referrals and follow-up tracking',
  'Earlier identification of patients needing higher-level attention',
  'Stronger maternal, newborn and child health monitoring',
  'Reliable information for planning, resource allocation and policy',
  'A scalable foundation for a statewide digital health ecosystem',
];

const requests = [
  'Government endorsement and institutional collaboration',
  'Access to selected primary healthcare facilities for initial deployment',
  'Identification of secondary and tertiary referral institutions for integration',
  'Technical engagement with state health information and digital health teams',
  'Support for healthcare worker training, onboarding and implementation',
  'A framework for evaluating pilot outcomes and a sustainable statewide model',
];

export function Home() {
  return (
    <div>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="overline hero-overline">Concept note <span className="rule-sep"></span> Oyo State</p>
            <h1 className="hero-title">The record should travel with the patient.</h1>
            <p className="hero-deck">An interoperable electronic medical records and healthcare referral system for Oyo State's primary, secondary and tertiary facilities — and a working triage console behind it.</p>
            <dl className="hero-meta">
              <div className="meta-pair"><dt>Submitted to</dt><dd>The Oyo State Government</dd></div>
              <div className="meta-pair"><dt>Prepared by</dt><dd>MedERNg Digital Health Lab</dd></div>
            </dl>
            <div className="hero-actions">
              <Link className="text-link text-link-primary" href="#reality" onClick={(e) => { e.preventDefault(); document.getElementById('reality')?.scrollIntoView({ behavior: 'smooth' }); }}>Read the concept note</Link>
              <Link className="text-link" to="/login">Open the platform</Link>
            </div>
          </div>
          <figure className="hero-figure">
            <div className="image-frame hero-image-frame"><img src="/assets/img/hero-community.jpg" alt="Healthcare workers attending to a patient during a community outreach in Nigeria" width="1800" height="1200" /></div>
            <figcaption>Community medical outreach, Kaduna, Nigeria <span className="caption-sep"></span> Photograph: mk_photoz / Pexels</figcaption>
          </figure>
        </div>
      </section>

      <section className="chapter" id="reality">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">01</span><span className="rail-label">The reality</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">The problem</p><h2>Information stops at the facility boundary.</h2></header>
            <p className="lead">Nigeria's healthcare system depends on accurate documentation and the ability to exchange it across three levels of care. In practice, both are missing.</p>
            <p>At primary healthcare level, registration, histories, consultations, diagnoses, medicines, immunisations, investigations and follow-up are often kept on paper or in fragmented files. Secondary and tertiary facilities face the same disconnection.</p>
            <div className="problem-grid">
              {problems.map(([title, body]) => <article className="problem-item" key={title}><h3>{title}</h3><p>{body}</p></article>)}
            </div>
          </div>
        </div>
        <figure className="band-figure"><div className="shell band-figure-inner">
          <div className="image-frame band-image-frame"><img src="/assets/img/primary-care.jpg" alt="Patients waiting outdoors at a primary care outreach" width="1800" height="1200" /></div>
          <figcaption>Where most patients first meet the health system <span className="caption-sep"></span> Photograph: Denis Ngai / Pexels</figcaption>
        </div></figure>
      </section>

      <section className="chapter chapter-tinted" id="platform">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">02</span><span className="rail-label">The platform</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Proposed solution</p><h2>One record, connected across every level of care.</h2></header>
            <p className="lead">The MedERNg interoperable health information platform digitises records, secures information exchange between facilities and coordinates patient care.</p>
            <div className="capability-grid">
              {capabilities.map(([title, body]) => <article className="capability-item" key={title}><h3>{title}</h3><p>{body}</p></article>)}
            </div>
            <figure className="inline-figure">
              <div className="image-frame inline-image-frame"><img src="/assets/img/consultation-lagos.jpg" alt="A healthcare professional checking a patient's blood pressure in a Lagos clinic" width="1800" height="1200" /></div>
              <figcaption>A blood pressure check in a Lagos clinic <span className="caption-sep"></span> Photograph: Ninthgrid / Pexels</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="chapter" id="pathway">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">03</span><span className="rail-label">Referral path</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Continuity in practice</p><h2>A structured handover, from first contact to definitive care.</h2></header>
            <p className="lead">Referral is a sequence, not a note handed to a patient. Each step is visible to the facilities involved.</p>
            <ol className="path-steps">
              {[
                ['Initiate', 'A participating primary healthcare centre opens a digital referral with the patient summary and clinical findings.'],
                ['Authorise', 'The receiving facility accesses only the information relevant to that referral and that patient.'],
                ['Track', 'Referral status and the patient’s movement stay visible across both facilities.'],
                ['Document', 'Subsequent care is recorded against the same longitudinal patient record.'],
              ].map(([title, body], i) => <li key={title}><span className="step-index">{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{body}</p></li>)}
            </ol>
            <p className="chapter-link"><Link className="text-link text-link-primary" to="/protocol">See the full six-state referral protocol</Link></p>
          </div>
        </div>
      </section>

      <section className="chapter chapter-tinted" id="implementation">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">04</span><span className="rail-label">Implementation</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Delivery</p><h2>Four phases, built with the state.</h2></header>
            <p className="lead">Implementation proceeds with the Oyo State Ministry of Health, the Primary Health Care Board, the Hospital Management Board and relevant public and private institutions.</p>
            <div className="phase-list">
              {phases.map(([num, title, body]) => <article className="phase-row" key={num}><span className="phase-number">{num}</span><div className="phase-content"><h3>{title}</h3><p>{body}</p></div></article>)}
            </div>
          </div>
        </div>
      </section>

      <section className="chapter" id="outcomes">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">05</span><span className="rail-label">Public health value</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Expected outcomes</p><h2>What connected records make possible.</h2></header>
            <ol className="outcome-grid">{outcomes.map((o) => <li key={o}>{o}</li>)}</ol>
            <figure className="inline-figure">
              <div className="image-frame inline-image-frame"><img src="/assets/img/ward-nigeria.jpg" alt="A nurse attending to a child and his father in a hospital ward in Nigeria" width="1800" height="1200" /></div>
              <figcaption>Continuity depends on what the next clinician can see <span className="caption-sep"></span> Photograph: Speak Media Uganda / XiGe-STUDIO / Pexels</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="chapter chapter-tinted" id="governance">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">06</span><span className="rail-label">Governance</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Security and interoperability</p><h2>Built on trust, not just technology.</h2></header>
            <p className="lead">Patient confidentiality and responsible health information management are central to the proposal.</p>
            <p>MedERNg's existing platform uses role-based access control and encrypted database storage. Statewide deployment adds data-sharing agreements, patient consent, access governance, audit logging, security assessments and compliance with the Nigeria Data Protection Act 2023.</p>
            <dl className="governance-list">
              <div><dt>Access</dt><dd>Role-based control with password authentication</dd></div>
              <div><dt>Storage</dt><dd>Encrypted databases and structured audit logs</dd></div>
              <div><dt>Consent</dt><dd>Data-sharing agreements and patient access governance</dd></div>
              <div><dt>Compliance</dt><dd>Nigeria Data Protection Act 2023</dd></div>
              <div><dt>Standards</dt><dd>Nigeria Digital Health Architecture alignment</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="chapter" id="partnership">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-number">07</span><span className="rail-label">Partnership</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Request for government partnership</p><h2>What we ask of government.</h2></header>
            <p className="lead">MedERNg respectfully seeks consideration as a technology and implementation partner, beginning with selected facilities and progressing to phased statewide deployment under a funded implementation contract.</p>
            <ol className="request-list">{requests.map((r) => <li key={r}>{r}</li>)}</ol>
            <div className="contact-block">
              <div><span className="contact-label">Correspondence</span><a className="text-link text-link-primary" href="mailto:admin@mederng.com">admin@mederng.com</a></div>
              <div><span className="contact-label">Platform</span><Link className="text-link" to="/login">Sign in to the triage console</Link></div>
            </div>
          </div>
        </div>
      </section>

      <section className="vision">
        <div className="shell vision-grid">
          <p className="overline">Our vision</p>
          <div className="vision-copy">
            <blockquote><span className="vision-marker" aria-hidden="true" />A patient's medical information should not become fragmented when they move between healthcare facilities.</blockquote>
            <p>It should remain accessible, secure and useful throughout their healthcare journey.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

const states = [
  ['DRAFT', 'Auto-saved locally on the ward device'],
  ['SENT', 'Dispatched to the receiving facility'],
  ['DELIVERED', 'Push alert with SMS fallback'],
  ['SEEN', 'Receiving clinician opens the detail sheet'],
  ['ACCEPTED', 'Bed reserved, receiving team locked'],
  ['TRANSFERRED', 'Patient admitted, audit closed'],
];

const tiers = [
  ['CRITICAL', 'Less than 15 minute target', 'Immediate life threats: eclampsia, cardiac arrest, polytrauma, GCS < 9.'],
  ['URGENT', 'Less than 1 hour target', 'Urgent intervention: acute abdomen, severe sepsis, closed fractures.'],
  ['ROUTINE', 'Less than 24 hour target', 'Elective and subacute: specialty consults, stable oncology, rehabilitation.'],
];

export function Protocol() {
  return (
    <div className="content-page">
      <section className="chapter">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-label">Protocol</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Layer 02</p><h2>The unbroken referral loop.</h2></header>
            <p className="lead">Every referral moves through a finite set of states, with automatic timestamping and bi-directional clinical communication.</p>
            <ol className="path-steps protocol-states">
              {states.map(([name, desc], i) => <li key={name}><span className="step-index">{String(i + 1).padStart(2, '0')}</span><h3>{name}</h3><p>{desc}</p></li>)}
            </ol>
          </div>
        </div>
      </section>
      <section className="chapter chapter-tinted">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-label">Severity</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Layer 03</p><h2>Three tiers of clinical triage.</h2></header>
            <p className="lead">Clear clinical triggers dictate response targets, visual alerts and escalation pathways.</p>
            <div className="tier-grid">
              {tiers.map(([name, target, desc]) => <article className="tier-item" key={name}>
                <h3>{name}</h3><p className="tier-target">{target}</p><p>{desc}</p>
              </article>)}
            </div>
            <dl className="governance-list">
              <div><dt>Visual</dt><dd>Tracked severity label with a square marker and a low-radius edge</dd></div>
              <div><dt>Response</dt><dd>Elapsed clock against the tier target</dd></div>
              <div><dt>Audit</dt><dd>Every transition recorded with actor and timestamp</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

const principles = [
  ['Task before information', 'Prioritise what the clinician needs to do now over lengthy summaries. One dominant action per screen.'],
  ['Status before detail', 'Urgency and elapsed time dominate over clinical prose.'],
  ['One primary action', 'A clear hierarchy removes decision paralysis in busy casualty wards.'],
  ['Progressive disclosure', 'Minimal data on list cards; full vitals and timeline in the detail sheet.'],
  ['Interruption is normal', 'An emergency call, siren or dying battery must never delete a draft. Every keystroke is saved locally.'],
];

export function WardResilience() {
  return (
    <div className="content-page">
      <section className="chapter">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-label">Ward resilience</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Layer 04</p><h2>Built for the real Nigerian ward nurse.</h2></header>
            <p className="lead">The interface is designed to survive weak 3G networks, power surges and busy casualty triage.</p>
            <div className="problem-grid">
              {principles.map(([title, body], i) => <article className="problem-item" key={title}><h3>{title}</h3><p>{body}</p></article>)}
            </div>
            <dl className="governance-list">
              <div><dt>Offline</dt><dd>Local auto-draft replaces a lost connection with a saved draft</dd></div>
              <div><dt>Device</dt><dd>Tested on Android 8 and above on 3G ward Wi-Fi</dd></div>
              <div><dt>Recovery</dt><dd>Draft restored on return, with no loss of entered clinical detail</dd></div>
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Facilities() {
  const [facilities, setFacilities] = useState([]);
  useEffect(() => { api('/facilities').then(setFacilities).catch(() => setFacilities([])); }, []);
  const groups = [
    ['Tertiary', 'tertiary', 'University teaching and federal medical centres providing definitive care.'],
    ['Specialist', 'specialist', 'Maternity and children’s hospitals with focused maternal and neonatal triage.'],
    ['Secondary', 'secondary', 'General hospitals providing higher-level assessment and stabilisation.'],
    ['Primary', 'primary', 'Healthcare centres where patients first register and receive ongoing care.'],
  ];
  return (
    <div className="content-page">
      <section className="chapter">
        <div className="shell chapter-grid">
          <aside className="chapter-rail" aria-hidden="true"><span className="rail-label">Facilities</span></aside>
          <div className="chapter-body">
            <header className="chapter-head"><p className="overline">Participating network</p><h2>Coordinating the healthcare hierarchy.</h2></header>
            <p className="lead">From primary healthcare centres to federal medical centres and teaching hospitals, MedERNg provides one handoff standard across public and private tiers.</p>
            <div className="facility-groups">
              {groups.map(([label, level, desc]) => (
                <section className="facility-group" key={level}>
                  <div className="facility-group-head"><h3>{label}</h3><p>{desc}</p></div>
                  <ul>{facilities.filter((f) => f.level === level).map((f) => <li key={f.id}>{f.name}<span>{f.lga || f.state}</span></li>)}</ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
