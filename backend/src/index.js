import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import db from './db.js';
import { login, authMiddleware, hash } from './auth.js';

const app = express();
app.use(cors());
app.use(express.json());

// ---- Auth
app.post('/auth/login', (req,res)=>{
  const { email, password } = req.body||{};
  const session = login(email, password);
  if(!session) return res.status(401).json({error:'invalid credentials'});
  res.json(session);
});

// Registro de usuário simples
app.post('/auth/register', (req, res) => {
  const { email, password, role = 'professor' } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'email e password são obrigatórios' });
  }

  const id = crypto.randomUUID();
  try {
    db.prepare(
      'INSERT INTO users(id,email,password_hash,role) VALUES (?,?,?,?)'
    ).run(id, email, hash(password), role);

    res.status(201).json({ id, email, role });
  } catch (err) {
    if (String(err.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'E-mail já cadastrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao registrar usuário' });
  }
});

// ---- Participants
app.get('/participants', (req,res)=>{
  const rows = db.prepare('SELECT * FROM participants ORDER BY created_at DESC').all();
  res.json(rows);
});
app.post('/participants', authMiddleware(['admin']), (req,res)=>{
  const { name, birthdate, guardian, contact } = req.body||{};
  if(!name) return res.status(400).json({error:'name required'});
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO participants(id,name,birthdate,guardian,contact) VALUES (?,?,?,?,?)')
    .run(id,name,birthdate,guardian,contact);
  res.status(201).json({id});
});
app.put('/participants/:id', authMiddleware(['admin']), (req,res)=>{
  const { id } = req.params;
  const { name, birthdate, guardian, contact } = req.body||{};
  db.prepare('UPDATE participants SET name=?, birthdate=?, guardian=?, contact=? WHERE id=?')
    .run(name,birthdate,guardian,contact,id);
  res.json({ok:true});
});
app.delete('/participants/:id', authMiddleware(['admin']), (req,res)=>{
  db.prepare('DELETE FROM participants WHERE id=?').run(req.params.id);
  res.json({ok:true});
});

// ---- Volunteers
app.get('/volunteers', (req,res)=>{
  const rows = db.prepare('SELECT * FROM volunteers ORDER BY created_at DESC').all();
  res.json(rows);
});
app.post('/volunteers', authMiddleware(['admin']), (req,res)=>{
  const { name, contact } = req.body||{};
  if(!name) return res.status(400).json({error:'name required'});
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO volunteers(id,name,contact) VALUES (?,?,?)').run(id,name,contact);
  res.status(201).json({id});
});
app.put('/volunteers/:id', authMiddleware(['admin']), (req,res)=>{
  const { id } = req.params;
  const { name, contact } = req.body||{};
  db.prepare('UPDATE volunteers SET name=?, contact=? WHERE id=?').run(name,contact,id);
  res.json({ok:true});
});
app.delete('/volunteers/:id', authMiddleware(['admin']), (req,res)=>{
  db.prepare('DELETE FROM volunteers WHERE id=?').run(req.params.id);
  res.json({ok:true});
});

// ---- Activities
app.get('/activities', (req,res)=>{
  const rows = db.prepare('SELECT * FROM activities ORDER BY name').all();
  res.json(rows);
});
app.post('/activities', authMiddleware(['admin']), (req,res)=>{
  const { name, description } = req.body||{};
  if(!name) return res.status(400).json({error:'name required'});
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO activities(id,name,description) VALUES (?,?,?)').run(id,name,description);
  res.status(201).json({id});
});
app.put('/activities/:id', authMiddleware(['admin']), (req,res)=>{
  const { id } = req.params;
  const { name, description } = req.body||{};
  db.prepare('UPDATE activities SET name=?, description=? WHERE id=?').run(name,description,id);
  res.json({ok:true});
});
app.delete('/activities/:id', authMiddleware(['admin']), (req,res)=>{
  db.prepare('DELETE FROM activities WHERE id=?').run(req.params.id);
  res.json({ok:true});
});

// ---- Enrollments
app.post('/enrollments', authMiddleware(['admin']), (req,res)=>{
  const { participantId, activityId } = req.body||{};
  if(!participantId||!activityId) return res.status(400).json({error:'participantId and activityId required'});
  try{
    db.prepare('INSERT INTO enrollments(participant_id,activity_id) VALUES (?,?)').run(participantId,activityId);
    res.status(201).json({ok:true});
  }catch(e){
    res.status(409).json({error:'already enrolled'});
  }
});

// ---- Attendance
app.post('/attendance/mark', authMiddleware(['admin','professor']), (req,res)=>{
  const { activityId, date, presences } = req.body||{};
  if(!activityId||!date||!Array.isArray(presences)) return res.status(400).json({error:'invalid payload'});
  const del = db.prepare('DELETE FROM attendance WHERE activity_id=? AND date=?');
  del.run(activityId, date);
  const ins = db.prepare('INSERT INTO attendance(id,activity_id,participant_id,date,status) VALUES (?,?,?,?,?)');
  const tx = db.transaction((items)=>{
    for(const it of items){
      ins.run(crypto.randomUUID(), activityId, it.participantId, date, it.status==='present'?'present':'absent');
    }
  });
  tx(presences);
  res.json({ok:true});
});

app.get('/attendance', (req,res)=>{
  const { activityId, date } = req.query;
  if(!activityId||!date) return res.status(400).json({error:'activityId and date required'});
  const participants = db.prepare('SELECT p.* FROM participants p JOIN enrollments e ON p.id=e.participant_id WHERE e.activity_id=? ORDER BY p.name').all(activityId);
  const presentRows = db.prepare('SELECT participant_id FROM attendance WHERE activity_id=? AND date=? AND status="present"').all(activityId, date);
  res.json({
    participants,
    presentIds: presentRows.map(r=>r.participant_id)
  });
});

// ---- Reports
app.get('/reports/attendance', (req,res)=>{
  const { start, end } = req.query;
  if(!start||!end) return res.status(400).json({error:'start and end required'});
  const rows = db.prepare(`
    SELECT a.name as activity, t.date as date, SUM(CASE WHEN t.status='present' THEN 1 ELSE 0 END) as presentCount
    FROM attendance t
    JOIN activities a ON a.id = t.activity_id
    WHERE date(t.date) BETWEEN date(?) AND date(?)
    GROUP BY a.name, t.date
    ORDER BY t.date DESC, a.name
  `).all(start, end);
  res.json(rows);
});

// ---- Events
app.get('/events', (req,res)=>{
  const rows = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
  res.json(rows);
});
app.post('/events', authMiddleware(['admin']), (req,res)=>{
  const { title, date, start_time, end_time, location } = req.body||{};
  if(!title || !date) return res.status(400).json({error:'title and date required'});
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO events(id,title,date,start_time,end_time,location) VALUES (?,?,?,?,?,?)')
    .run(id,title,date,start_time,end_time,location);
  res.status(201).json({id});
});
app.put('/events/:id', authMiddleware(['admin']), (req,res)=>{
  const { id } = req.params;
  const { title, date, start_time, end_time, location } = req.body||{};
  db.prepare('UPDATE events SET title=?, date=?, start_time=?, end_time=?, location=? WHERE id=?')
    .run(title,date,start_time,end_time,location,id);
  res.json({ok:true});
});
app.delete('/events/:id', authMiddleware(['admin']), (req,res)=>{
  db.prepare('DELETE FROM events WHERE id=?').run(req.params.id);
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
