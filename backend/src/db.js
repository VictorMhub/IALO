import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'ialo.db');
const db = new Database(DB_PATH);

const schema = `
CREATE TABLE IF NOT EXISTS participants(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birthdate TEXT,
  guardian TEXT,
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS volunteers(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS activities(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);
CREATE TABLE IF NOT EXISTS enrollments(
  participant_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  UNIQUE(participant_id, activity_id)
);
CREATE TABLE IF NOT EXISTS attendance(
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT
);
CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL
);
`;

db.exec(schema);

export default db;
