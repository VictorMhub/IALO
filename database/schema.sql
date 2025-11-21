-- Esquema de banco (referência). Para SQLite local, as tabelas são criadas automaticamente em runtime.
CREATE TABLE participants(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  birthdate TEXT,
  guardian TEXT,
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE volunteers(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE activities(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT
);
CREATE TABLE enrollments(
  participant_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  UNIQUE(participant_id, activity_id)
);
CREATE TABLE attendance(
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL
);
CREATE TABLE events(
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  location TEXT
);
CREATE TABLE users(
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL
);
