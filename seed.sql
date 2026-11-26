INSERT INTO facilities (name, level, lga, state) VALUES
 ('Adeoyo Maternity Teaching Hospital, Ibadan','specialist','Ibadan North','Oyo'),
 ('University College Hospital, Ibadan','tertiary','Ibadan North','Oyo'),
 ('Ring Road State Hospital, Ibadan','tertiary','Ibadan North West','Oyo'),
 ('Jericho Specialist Hospital, Ibadan','tertiary','Ibadan North West','Oyo'),
 ('Oni Memorial Children''s Hospital, Ibadan','specialist','Ibadan North','Oyo'),
 ('General Hospital, Ibadan','secondary','Ibadan North','Oyo'),
 ('Primary Health Centre, Ibadan North','primary','Ibadan North','Oyo'),
 ('Primary Health Centre, Ibadan South East','primary','Ibadan South East','Oyo'),
 ('Federal Medical Centre Ebuta Metta (FMC)','tertiary','Ebuta Metta','Lagos'),
 ('Lagos University Teaching Hospital (LUTH)','tertiary','Idi-Araba','Lagos'),
 ('St. Mary''s Specialist Hospital','specialist','Lagos Island','Lagos'),
 ('Lagos Island Maternity Hospital','specialist','Lagos Island','Lagos')
ON CONFLICT DO NOTHING;

INSERT INTO referrals (folder_id, ref_number, created_by, from_facility_id, to_facility_id,
  patient_initials, patient_age, patient_sex, severity, status, clinical_summary, vitals, bed_assignment,
  created_at, sent_at, accepted_at)
SELECT v.folder_id, v.ref,
 (SELECT id FROM users WHERE email='demo.clinician@mederng.com'),
 (SELECT facility_id FROM users WHERE email='demo.clinician@mederng.com'),
 (SELECT id FROM facilities WHERE name='Primary Health Centre, Ibadan South East'),
 v.folder_id, v.age, v.sex, v.sev, v.status, v.summary, v.vitals::jsonb, v.bed,
 now() - (v.mins || ' minutes')::interval, now() - (v.mins || ' minutes')::interval,
 CASE WHEN v.status IN ('ACCEPTED','TRANSFERRED') THEN now() - ((v.mins-8) || ' minutes')::interval ELSE NULL END
FROM (VALUES
 ('PAT-M-1201','REF-2026-217655',25,'F','CRITICAL','SENT','patient with gcs of 9 involved in a road traffic accident, we refer this patient for expert care','{"bp":"90/60 mmHg","hr":"122 bpm","spo2":"91%"}',NULL,8),
 ('PAT-M-1202','REF-2026-819197',56,'F','CRITICAL','SEEN','Severe haemorrhage requiring urgent transfusion','{"bp":"82/50 mmHg","hr":"130 bpm","spo2":"94%"}',NULL,34),
 ('PAT-M-1098','REF-2026-929644',21,'F','ROUTINE','TRANSFERRED','The evaluation and management of persistent asthma symptoms','{"bp":"118/76 mmHg","hr":"88 bpm","spo2":"97%"}','Ward 04',326),
 ('PAT-M-1045','REF-2026-440218',19,'M','URGENT','ACCEPTED','Acute abdominal pain with suspected appendicitis','{"bp":"128/82 mmHg","hr":"104 bpm","temp":"38.1 °C"}','Surgical Bay 02',92)
) AS v(folder_id,ref,age,sex,sev,status,summary,vitals,bed,mins)
WHERE NOT EXISTS (SELECT 1 FROM referrals r WHERE r.ref_number=v.ref);

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'SENT', (SELECT id FROM users WHERE email='demo.clinician@mederng.com'), 'Referral sent to receiving facility', created_at
FROM referrals WHERE ref_number IN ('REF-2026-217655','REF-2026-819197','REF-2026-929644','REF-2026-440218');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'DELIVERED', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), 'Casualty push alert delivered', created_at + interval '1 minute'
FROM referrals WHERE ref_number IN ('REF-2026-819197','REF-2026-929644','REF-2026-440218');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'SEEN', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), 'Detail sheet opened by receiving clinician', created_at + interval '2 minutes'
FROM referrals WHERE ref_number IN ('REF-2026-819197','REF-2026-929644','REF-2026-440218');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'ACCEPTED', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), COALESCE('Bed reserved: ' || bed_assignment, 'Bed reserved'), created_at + interval '4 minutes'
FROM referrals WHERE ref_number IN ('REF-2026-929644','REF-2026-440218');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'TRANSFERRED', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), 'Patient admitted', created_at + interval '6 minutes'
FROM referrals WHERE ref_number IN ('REF-2026-929644');

INSERT INTO referrals (folder_id, ref_number, created_by, from_facility_id, to_facility_id,
  patient_initials, patient_age, patient_sex, severity, status, clinical_summary, vitals, bed_assignment,
  created_at, sent_at, accepted_at)
SELECT v.folder_id, v.ref, (SELECT id FROM users WHERE email='adesinaisaiah100@gmail.com'),
 (SELECT facility_id FROM users WHERE email='adesinaisaiah100@gmail.com'),
 (SELECT id FROM facilities WHERE name='Primary Health Centre, Ibadan South East'),
 v.folder_id, v.age, v.sex, v.sev, v.status, v.summary, v.vitals::jsonb, v.bed,
 now() - (v.mins || ' minutes')::interval, now() - (v.mins || ' minutes')::interval,
 CASE WHEN v.status='ACCEPTED' THEN now() - ((v.mins-8) || ' minutes')::interval ELSE NULL END
FROM (VALUES
 ('PAT-M-1301','REF-2026-660311',34,'F','CRITICAL','SENT','34yo G2P1 at 38 weeks gestation with severe pre-eclampsia BP 175/110 mmHg, requiring urgent ICU bed','{"bp":"175/110 mmHg","hr":"112 bpm","spo2":"96%"}',NULL,12),
 ('PAT-M-1302','REF-2026-551882',25,'M','URGENT','ACCEPTED','Severe malaria with vomiting, unable to tolerate oral medication','{"bp":"112/70 mmHg","hr":"104 bpm","temp":"39.2 °C"}','Ward 06',68),
 ('PAT-M-1303','REF-2026-774120',42,'F','ROUTINE','TRANSFERRED','Follow-up review for controlled hypertension and medication reconciliation','{"bp":"132/84 mmHg","hr":"78 bpm"}','Clinic 02',280)
) AS v(folder_id,ref,age,sex,sev,status,summary,vitals,bed,mins)
WHERE NOT EXISTS (SELECT 1 FROM referrals r WHERE r.ref_number=v.ref);

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'SENT', (SELECT id FROM users WHERE email='adesinaisaiah100@gmail.com'), 'Referral sent to receiving facility', created_at
FROM referrals WHERE ref_number IN ('REF-2026-660311','REF-2026-551882','REF-2026-774120');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'DELIVERED', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), 'Casualty push alert delivered', created_at + interval '1 minute'
FROM referrals WHERE ref_number IN ('REF-2026-551882','REF-2026-774120');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'SEEN', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), 'Detail sheet opened by receiving clinician', created_at + interval '2 minutes'
FROM referrals WHERE ref_number IN ('REF-2026-551882','REF-2026-774120');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'ACCEPTED', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), COALESCE('Bed reserved: ' || bed_assignment, 'Bed reserved'), created_at + interval '4 minutes'
FROM referrals WHERE ref_number IN ('REF-2026-551882','REF-2026-774120');

INSERT INTO referral_events (referral_id, status, actor_id, note, created_at)
SELECT id, 'TRANSFERRED', (SELECT id FROM users WHERE email='demo.receiver@mederng.com'), 'Patient admitted', created_at + interval '6 minutes'
FROM referrals WHERE ref_number IN ('REF-2026-774120');
