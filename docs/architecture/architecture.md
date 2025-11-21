# Arquitetura final implementada

## Visão
Frontend Web (estático) ⇄ REST API (Express) ⇄ SQLite

- **Frontend:** HTML, CSS, JS (fetch na API). Servido com `lite-server` em dev.
- **Backend:** Node.js + Express. Banco `SQLite` via `better-sqlite3`.
- **Autenticação:** Login com usuários de demonstração; token simples no header `Authorization: Bearer <token>`.
- **Perfis:** Admin e Professor (middleware autoriza por papel).
- **Testes:** Jest + Supertest no backend.

## Esquema de Dados
- `participants(id, name, birthdate, guardian, contact, created_at)`
- `volunteers(id, name, contact, created_at)`
- `activities(id, name, description)`
- `enrollments(participant_id, activity_id, UNIQUE)`
- `attendance(id, activity_id, participant_id, date, status)`
- `events(id, title, date, start_time, end_time, location)`
- `users(id, email, password_hash, role)`

Ver `database/schema.sql`.

## Justificativas
- **SQLite**: simplicidade no DEV/offline; pode migrar para **PostgreSQL** em produção.
- **JS puro no Web**: reduz curva de aprendizagem para o time e atende às telas da ONG.
