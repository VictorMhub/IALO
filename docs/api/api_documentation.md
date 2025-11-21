# Documentação da API

Base URL: `http://localhost:3000`

Autenticação:
- `POST /auth/login` → `{ email, password }` → `{ token, role }`
- Envie `Authorization: Bearer <token>` nas demais rotas.

## Participants
- `GET /participants`
- `POST /participants` `{ name, birthdate?, guardian?, contact? }` *(Admin)*
- `PUT /participants/:id` *(Admin)*
- `DELETE /participants/:id` *(Admin)*

## Volunteers
- `GET /volunteers`
- `POST /volunteers` `{ name, contact? }` *(Admin)*
- `PUT /volunteers/:id` *(Admin)*
- `DELETE /volunteers/:id` *(Admin)*

## Activities & Enrollments
- `GET /activities`
- `POST /activities` `{ name, description? }` *(Admin)*
- `PUT /activities/:id` *(Admin)*
- `DELETE /activities/:id` *(Admin)*
- `POST /enrollments` `{ participantId, activityId }` *(Admin)*

## Attendance
- `POST /attendance/mark` `{ activityId, date, presences: [ { participantId, status } ] }` *(Professor/Admin)*
- `GET /attendance?activityId=...&date=YYYY-MM-DD`

## Reports
- `GET /reports/attendance?start=YYYY-MM-DD&end=YYYY-MM-DD`

## Events
- `GET /events`
- `POST /events` `{ title, date, start_time?, end_time?, location? }` *(Admin)*
- `PUT /events/:id` *(Admin)*
- `DELETE /events/:id` *(Admin)*
