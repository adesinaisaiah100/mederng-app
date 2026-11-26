import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, query, one } from './db.js';
import { signToken, requireAuth, requireRole, cookieOptions } from './auth.js';

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
app.use(cookieParser());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const attempts = new Map();

function publicUser(u) {
  return { id: u.id, email: u.email, full_name: u.full_name, role: u.role, facility_id: u.facility_id, facility_name: u.facility_name || null };
}

function rateLimited(key) {
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, reset: now + 15 * 60 * 1000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 15 * 60 * 1000; }
  entry.count += 1;
  attempts.set(key, entry);
  return entry.count > 12;
}

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/facilities', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT id, name, level, lga, state FROM facilities ORDER BY level, name');
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { email, password, full_name, facility_id } = req.body || {};
    if (!EMAIL.test(email || '') || !full_name?.trim() || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'A valid email, name and password of at least 8 characters are required' });
    }
    if (rateLimited(`register:${req.ip}`)) return res.status(429).json({ error: 'Too many attempts. Try again later' });
    if (facility_id) {
      const facility = await one('SELECT id FROM facilities WHERE id = $1', [facility_id]);
      if (!facility) return res.status(400).json({ error: 'Unknown facility' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await one(
      `INSERT INTO users (email, password_hash, full_name, role, facility_id)
       VALUES ($1,$2,$3,'referrer',$4) RETURNING id, email, full_name, role, facility_id, token_version`,
      [email.toLowerCase().trim(), hash, full_name.trim(), facility_id || null]
    );
    res.cookie('mederng_session', signToken(user), cookieOptions);
    res.status(201).json({ user: publicUser(user) });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'An account with that email already exists' });
    next(e);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!EMAIL.test(email || '') || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (rateLimited(`login:${req.ip}`)) return res.status(429).json({ error: 'Too many attempts. Try again later' });
    const user = await one(
      `SELECT u.*, f.name AS facility_name FROM users u LEFT JOIN facilities f ON f.id = u.facility_id WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }
    res.cookie('mederng_session', signToken(user), cookieOptions);
    res.json({ user: publicUser(user) });
  } catch (e) { next(e); }
});

app.post('/api/auth/logout', requireAuth, async (req, res, next) => {
  try {
    await query('UPDATE users SET token_version = token_version + 1 WHERE id = $1', [req.user.id]);
    res.clearCookie('mederng_session', { path: '/' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

app.get('/api/auth/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));

function referralSelect() {
  return `SELECT r.*, ffrom.name AS from_facility_name, fto.name AS to_facility_name,
    u.full_name AS initiator_name,
    (SELECT count(*)::int FROM referral_messages m WHERE m.referral_id = r.id) AS message_count
    FROM referrals r
    LEFT JOIN facilities ffrom ON ffrom.id = r.from_facility_id
    LEFT JOIN facilities fto ON fto.id = r.to_facility_id
    LEFT JOIN users u ON u.id = r.created_by`;
}

app.get('/api/referrals', requireAuth, async (req, res, next) => {
  try {
    if (req.query.view === 'received' && !['receiving', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Triage feed is available to receiving staff' });
    }
    const view = req.query.view === 'received' ? 'received' : 'sent';
    const clause = view === 'received' ? 'r.to_facility_id = $1' : 'r.created_by = $1';
    const key = view === 'received' ? req.user.facility_id : req.user.id;
    const { rows } = await query(`${referralSelect()} WHERE ${clause} ORDER BY r.created_at DESC`, [key]);
    res.json(rows);
  } catch (e) { next(e); }
});

app.post('/api/referrals', requireAuth, async (req, res, next) => {
  try {
    const { folder_id, to_facility_id, patient_age, patient_sex, severity, clinical_summary, vitals } = req.body || {};
    if (!folder_id?.trim() || !to_facility_id || typeof clinical_summary !== 'string' || clinical_summary.trim().length < 10) {
      return res.status(400).json({ error: 'Patient ID, destination and a clinical reason of at least 10 characters are required' });
    }
    if (!['CRITICAL', 'URGENT', 'ROUTINE'].includes(severity)) return res.status(400).json({ error: 'Select a valid urgency level' });
    if (patient_age !== null && patient_age !== '' && (Number.isNaN(Number(patient_age)) || Number(patient_age) < 0 || Number(patient_age) > 120)) {
      return res.status(400).json({ error: 'Age must be between 0 and 120' });
    }
    if (vitals && (typeof vitals !== 'object' || Array.isArray(vitals))) return res.status(400).json({ error: 'Invalid observations' });
    if (!req.user.facility_id) return res.status(400).json({ error: 'Your account has no facility assigned' });
    if (to_facility_id === req.user.facility_id) return res.status(400).json({ error: 'Referrals cannot be routed to your own facility' });
    const destination = await one('SELECT id FROM facilities WHERE id = $1', [to_facility_id]);
    if (!destination) return res.status(400).json({ error: 'Unknown destination facility' });

    const ref = `REF-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
    const created = await one(
      `INSERT INTO referrals (folder_id, ref_number, created_by, from_facility_id, to_facility_id,
        patient_initials, patient_age, patient_sex, severity, status, clinical_summary, vitals, sent_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'SENT',$10,$11,now(),now())
       RETURNING *`,
      [folder_id.trim(), ref, req.user.id, req.user.facility_id, to_facility_id, folder_id.trim(),
        patient_age === '' ? null : patient_age || null, patient_sex === 'M' ? 'M' : 'F',
        severity, clinical_summary.trim(), vitals || {}]
    );
    await query('INSERT INTO referral_events (referral_id, status, actor_id, note) VALUES ($1,$2,$3,$4)',
      [created.id, 'SENT', req.user.id, 'Referral sent to receiving facility']);
    res.status(201).json(created);
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'That patient identifier or reference is already in use' });
    next(e);
  }
});

app.get('/api/referrals/:id', requireAuth, async (req, res, next) => {
  try {
    const r = await one(`${referralSelect()} WHERE r.id = $1`, [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Referral not found' });
    const allowed = req.user.role === 'admin' || r.created_by === req.user.id || r.to_facility_id === req.user.facility_id;
    if (!allowed) return res.status(403).json({ error: 'Not permitted to view this referral' });
    const events = (await query(
      `SELECT e.*, u.full_name AS actor_name, f.name AS actor_facility
       FROM referral_events e LEFT JOIN users u ON u.id = e.actor_id
       LEFT JOIN facilities f ON f.id = u.facility_id
       WHERE e.referral_id = $1 ORDER BY e.created_at`, [r.id])).rows;
    const messages = (await query(
      `SELECT m.*, u.full_name AS sender_name FROM referral_messages m
       LEFT JOIN users u ON u.id = m.sender_id WHERE m.referral_id = $1 ORDER BY m.created_at`, [r.id])).rows;
    res.json({ ...r, events, messages });
  } catch (e) { next(e); }
});

const transitions = {
  SENT: ['DELIVERED', 'DECLINED'],
  DELIVERED: ['SEEN', 'DECLINED'],
  SEEN: ['ACCEPTED', 'DECLINED'],
  ACCEPTED: ['TRANSFERRED'],
};

app.post('/api/referrals/:id/status', requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { status, note, bed_assignment } = req.body || {};
    if (!status) return res.status(400).json({ error: 'Target status is required' });
    const r = await one('SELECT * FROM referrals WHERE id = $1', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Referral not found' });
    if (!transitions[r.status]?.includes(status)) {
      return res.status(400).json({ error: `Cannot move from ${r.status} to ${status}` });
    }
    if (r.to_facility_id !== req.user.facility_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the receiving facility can change referral status' });
    }
    await client.query('BEGIN');
    const result = await client.query(`UPDATE referrals SET status=$2, updated_at=now(),
        accepted_at=CASE WHEN $2='ACCEPTED' THEN now() ELSE accepted_at END,
        transferred_at=CASE WHEN $2='TRANSFERRED' THEN now() ELSE transferred_at END,
        bed_assignment=COALESCE($3, bed_assignment)
       WHERE id=$1 AND status=$4 RETURNING *`,
      [r.id, status, bed_assignment || null, r.status]);
    const updated = result.rows[0];
    if (!updated) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Referral changed while you were working. Reload and retry' }); }
    await client.query('INSERT INTO referral_events (referral_id, status, actor_id, note) VALUES ($1,$2,$3,$4)',
      [r.id, status, req.user.id, note || null]);
    await client.query('COMMIT');
    res.json(updated);
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally { client.release(); }
});

app.post('/api/referrals/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const { body } = req.body || {};
    if (typeof body !== 'string' || !body.trim() || body.length > 2000) return res.status(400).json({ error: 'Message must be 1–2000 characters' });
    const r = await one('SELECT * FROM referrals WHERE id = $1', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Referral not found' });
    const allowed = r.created_by === req.user.id || r.to_facility_id === req.user.facility_id || req.user.role === 'admin';
    if (!allowed) return res.status(403).json({ error: 'Not permitted' });
    const msg = await one('INSERT INTO referral_messages (referral_id, sender_id, body) VALUES ($1,$2,$3) RETURNING *',
      [r.id, req.user.id, body.trim()]);
    res.status(201).json(msg);
  } catch (e) { next(e); }
});

app.post('/api/referrals/:id/request-info', requireAuth, async (req, res, next) => {
  try {
    const { note } = req.body || {};
    const r = await one('SELECT * FROM referrals WHERE id = $1', [req.params.id]);
    if (!r) return res.status(404).json({ error: 'Referral not found' });
    if (r.to_facility_id !== req.user.facility_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only the receiving facility can request information' });
    }
    await query("INSERT INTO referral_events (referral_id, status, actor_id, note) VALUES ($1,'MORE_INFO_REQUESTED',$2,$3)",
      [r.id, req.user.id, note || 'Additional clinical information requested']);
    res.status(201).json({ ok: true });
  } catch (e) { next(e); }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));
app.use(express.static(dist));
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong' }); });

if (process.env.VERCEL !== '1' && process.env.NODE_ENV !== 'serverless') {
  app.listen(PORT, () => console.log(`MedERNg API listening on http://localhost:${PORT}`));
}

export default app;
