import crypto from 'crypto';
import db from './db.js';

// Seed demo users if empty
const hasAny = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
if(!hasAny){
  const seed = db.prepare('INSERT OR IGNORE INTO users(id,email,password_hash,role) VALUES (?,?,?,?)');
  seed.run(crypto.randomUUID(), 'admin@ialo.org', hash('admin123'), 'admin');
  seed.run(crypto.randomUUID(), 'prof@ialo.org',  hash('prof123'),  'professor');
}

export function hash(pw){ return crypto.createHash('sha256').update(pw).digest('hex'); }

const tokenStore = new Map(); // token -> {email, role}

export function login(email, password){
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  if(!u) return null;
  if(u.password_hash !== hash(password)) return null;
  const token = crypto.randomBytes(24).toString('hex');
  tokenStore.set(token, { email: u.email, role: u.role });
  return { token, role: u.role };
}

export function authMiddleware(requiredRoles = []){
  return (req,res,next)=>{
    const auth = req.headers.authorization||'';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    const payload = token && tokenStore.get(token);
    if(!payload) return res.status(401).json({error:'unauthorized'});
    if(requiredRoles.length && !requiredRoles.includes(payload.role)){
      return res.status(403).json({error:'forbidden'});
    }
    req.user = payload;
    next();
  }
}
