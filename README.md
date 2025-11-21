# Sistema de Gestão de Atividades e Participantes — Instituto Além dos Olhos (IALO)

Aplicação **multiplataforma (Web + Backend)** para apoiar o Instituto Além dos Olhos (IALO) na gestão de:

- Participantes e voluntários
- Atividades e matrículas
- Frequência por atividade/data
- Eventos / calendário
- Relatórios simples de presença

Foco desta entrega: **Backend (API REST)** + **Frontend Web estático**.

---

## 1. Stack utilizada

- **Backend**
  - Node.js + Express
  - SQLite (via `better-sqlite3`)
  - Autenticação simples com token em memória
  - Testes com Jest + Supertest

- **Frontend Web**
  - HTML, CSS e JavaScript puro
  - `lite-server` para servir os arquivos estáticos em desenvolvimento
  - Integração com API via `fetch`
  - Auth via `localStorage` (token + role)

---

## 2. Estrutura do projeto

```text
IALO_multiplataforma_repo/
├─ backend/
│  ├─ package.json
│  └─ src/
│     ├─ db.js
│     ├─ auth.js
│     └─ index.js
├─ frontend/
│  └─ web/
│     ├─ package.json
│     ├─ index.html
│     ├─ login.html
│     ├─ register.html
│     ├─ participants.html
│     ├─ attendance.html
│     ├─ events.html
│     ├─ reports.html
│     ├─ public/
│     │  └─ style.css
│     └─ src/
│        ├─ config.js
│        ├─ auth.js
│        └─ header.js
├─ database/
│  └─ schema.sql        # esquema de referência (SQLite)
├─ docs/
│  ├─ architecture/
│  │  └─ architecture.md
│  ├─ api/
│  │  └─ api_documentation.md
│  └─ requirements/
│     └─ requirements.md
└─ validation/
   ├─ target_audience.md
   ├─ validation_report.md
   └─ evidence/
   └─ feedback/
      └─ README.md
```

## 3. Pré-requisitos

- Node.js ≥ 18 (recomendado 18 LTS ou 20 LTS)
- npm (vem junto com Node)
- Sistema operacional:
- Windows, macOS ou Linux
- Não é necessário instalar nada extra para o SQLite; o better-sqlite3 já cuida disso em modo local.

## 4. Backend — Setup e Execução
# 4.1. Instalar dependências
cd backend
npm install

# 4.2. Variáveis de ambiente
O backend usa:
- PORT (opcional): porta da API
- Default: 3000
- DB_PATH (opcional): caminho do arquivo SQLite
- Default: arquivo ialo.db criado na raiz do projeto (via process.cwd())

# Usando porta padrão (3000) e DB padrão (ialo.db)
npm run dev

# Mudando porta e local do DB
PORT=4000 DB_PATH=/caminho/para/ialo.db npm run dev

# No Windows (PowerShell):
$env:PORT=4000
$env:DB_PATH="C:\meus_dbs\ialo.db"
npm run dev

# 4.3. Rodar o servidor em modo dev
Na pasta backend:
npm run dev

Saída esperada:
API on http://localhost:3000

# 4.4. Banco de dados e seed inicial
Ao subir a API pela primeira vez:
- As tabelas são criadas automaticamente (ver database/schema.sql).
- Usuários de demonstração são criados em auth.js:
  - Admin
    - email: admin@ialo.org
    - senha: admin123
  - Professor
    - email: prof@ialo.org
    - senha: prof123

- As tabelas principais:
  - participants, volunteers, activities, enrollments,
attendance, events, users

# 4.5. Endpoints principais da API
Base URL: http://localhost:3000 (ou porta que você definiu).

# Autenticação
- POST /auth/login
Body: { "email": "...", "password": "..." }
Resposta: { "token": "<uuid>", "role": "admin" | "professor" }
- POST /auth/register
Body: { "email": "...", "password": "...", "role": "admin" | "professor" }
Resposta: { "id": "...", "email": "...", "role": "..." }

Rota de cadastro simples de usuário. Em produção, você pode restringir para ser chamada apenas por Admin.

Para todas as rotas protegidas, enviar no header:
Authorization: Bearer <token>

# Participants
- GET /participants
- POST /participants
Body: { "name": "...", "birthdate"?: "YYYY-MM-DD", "guardian"?: "...", "contact"?: "..." }
Permissão: Admin (por padrão)

- PUT /participants/:id (Admin)
- DELETE /participants/:id (Admin)

# Attendance

- POST /attendance/mark
Body: { "activityId": "...", "date": "YYYY-MM-DD", "presences": [{ "participantId": "...", "status": "present" | "absent" }] }
Permissão: Professor/Admin

- GET /attendance?activityId=...&date=YYYY-MM-DD

# Events

- GET /events
- POST /events (Admin)
- PUT /events/:id (Admin)
- DELETE /events/:id (Admin)

# Reports

- GET /reports/attendance?start=YYYY-MM-DD&end=YYYY-MM-DD

A documentação mais completa está em docs/api/api_documentation.md.

# 4.6. Rodar os testes do backend
cd backend
npm test

## 5. Frontend Web — Setup e Execução
# 5.1. Instalar dependências
cd frontend/web
npm install

# 5.2. Configuração da API (src/config.js)

Arquivo: frontend/web/src/config.js
export const API_BASE = localStorage.getItem('API_BASE') || 'http://localhost:3000';


- Por padrão, o frontend chama a API em http://localhost:3000.
- Para apontar para outra URL (por exemplo, um backend em produção):
  1. Abra o DevTools → Console
  2. Rode:
    localStorage.setItem('API_BASE', 'http://localhost:4000');
  3. Recarregue a página.

# 5.3. Rodar o servidor estático (lite-server)

Na pasta frontend/web:
npm start


O lite-server vai subir um servidor e abrir o navegador com alguma URL do tipo:
  - http://localhost:3000/
  ou
  - http://localhost:3001/, 3002/, 3003/… (se a porta padrão estiver em uso)

Veja no terminal qual porta o lite-server escolheu.

Você pode navegar para as páginas diretamente:
- http://localhost:PORT/login.html
- http://localhost:PORT/register.html
- http://localhost:PORT/participants.html
- http://localhost:PORT/attendance.html
- http://localhost:PORT/events.html
- http://localhost:PORT/reports.html

(Substitua PORT pela porta que o lite-server mostrou no terminal.)

## 6. Fluxo de Autenticação no Frontend
# 6.1. Arquivo src/auth.js

Responsável por salvar/ler token e role no localStorage e proteger páginas:
- Chaves usadas:
  - token — token de sessão retornado por /auth/login
  - role — papel do usuário (admin ou professor)

- Funções principais:
  - saveSession({ token, role })
  - getToken() / getRole()
  - clearSession()
  - requireAuth() → se não houver token, redireciona para login.html.

# 6.2. Arquivo src/header.js (botão “Sair”)
- Lê o token do localStorage.
- Se o usuário não estiver logado, esconde o botão Sair e mantém os links Login/Registrar.
- Se estiver logado:
  - Esconde os links de Login/Registrar.
  - Mostra o botão Sair.
  - Ao clicar em Sair, limpa token e role e redireciona para login.html.


## 7. Páginas principais do Frontend
# 7.1. login.html
- Formulário com email e senha.
- Envia POST /auth/login usando API_BASE.
- Em caso de sucesso:
    - Salva { token, role } no localStorage via saveSession.
    - Redireciona para index.html ou outra página inicial.
Credenciais de teste:
- Admin: admin@ialo.org / admin123
- Professor: prof@ialo.org / prof123

# 7.2. register.html

- Formulário simples com:
  - email
  - password
  - role (admin ou professor)
- Envia POST /auth/register.
- Em caso de sucesso, mostra mensagem e orienta o usuário a ir para a tela de Login.

# 7.3. participants.html

- Protegida por requireAuth() (só acessível autenticado).
- Lista de participantes e formulário Novo participante.
- Usa:
  - GET /participants para listar
  - POST /participants para criar
  - DELETE /participants/:id para excluir

Regra de permissão (default):
- Criar/editar/excluir participante: apenas Admin
- Exibir lista: pode ser disponibilizado para qualquer usuário autenticado (depende da lógica do frontend; por exemplo, esconder só o formulário se o role !== 'admin').

# 7.4. attendance.html

- Protegida por requireAuth().
- Carrega lista de atividades (GET /activities ou equivalente).
- Permite:
 - selecionar atividade + data
 - listar participantes da turma
 - marcar presente/ausente via checkboxes
 - enviar POST /attendance/mark

Permissões:
- Professor e Admin podem registrar frequência.

# 7.5. events.html

- Protegida por requireAuth().
- CRUD de eventos:
  - GET /events para listar
  - POST /events para criar (Admin)
  - DELETE /events/:id para excluir (Admin)

# 7.6. reports.html

- Protegida por requireAuth().
- Permite selecionar um intervalo de datas e chamar:
  - GET /reports/attendance?start=YYYY-MM-DD&end=YYYY-MM-DD
- Exibe um resumo de presença por período (tabelas simples).

# 8. Fluxo completo para rodar o projeto localmente

  1. Clonar o repositório ou baixar o .zip:
    git clone <URL_DO_REPO>
    cd IALO_multiplataforma_repo
  
  2. Subir o backend (API):
    cd backend
    npm install
    npm run dev
# API em http://localhost:3000 (por padrão)


3. Subir o frontend Web (em outro terminal):
    cd frontend/web
    npm install
    npm start
# lite-server abre o navegador, veja a porta exibida no terminal


4. Configurar API_BASE (se necessário):
  - Se o backend estiver em http://localhost:3000, não precisa fazer nada.
  - Se estiver em outra porta/host, abra o console do navegador e rode:
localStorage.setItem('API_BASE', 'http://localhost:4000');


5. Acessar a aplicação:
  - Abra http://localhost:PORT/login.html (PORT = porta do frontend/lite-server).
  - Faça login com:
    - admin@ialo.org / admin123 ou
    - prof@ialo.org / prof123
- Navegue pelas páginas:
    - Participantes
    - Frequência
    - Eventos
    - Relatórios

## 9. Resolução de problemas comuns
# 9.1. Erro 401 (Unauthorized) ao chamar a API
  - Significa que não foi enviado um token válido no header Authorization.
  - Verifique:
    - se você fez login em login.html antes de acessar as outras páginas;
    - se o localStorage possui a chave token;
    - se a requisição está enviando:
        Authorization: Bearer <token>

# 9.2. Erro 403 (Forbidden) ao criar participante/evento
- Significa que o usuário está autenticado, mas não tem permissão para a ação.
- Exemplo: POST /participants só permite Admin (por padrão).
- Solução:
    - logar com admin@ialo.org / admin123, ou
    - ajustar o authMiddleware([...]) no backend para permitir outros papéis.

# 9.3. Frontend e backend em portas diferentes
- Isso é normal: por exemplo, frontend em http://localhost:3003 e backend em http://localhost:3000.
- O backend já usa cors(), permitindo chamadas do frontend.
- Apenas garanta que API_BASE aponte para o host/porta corretos.

## 10. Documentação adicional
- Requisitos do sistema: docs/requirements/requirements.md
- Arquitetura: docs/architecture/architecture.md
- API detalhada: docs/api/api_documentation.md
- Relatórios de validação e feedback: pasta validation/

## 11. Equipe

- Victor Maia Ferreira Severiano — Frontend — 2326224 
- Nilza Maria Lima Alves  — Frontend — 2327647
- Francisco Cláudio dos Santos — Backend — 2327300
- Carlos Antunis Silva Barbosa Junior — Cyber Segurança — 2323805
- Paulo Sérgio Bernardo dos Santos Júnior — Backend — 2326263
...
