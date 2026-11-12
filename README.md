# TaskFlow — Plan Together. Build Better.

TaskFlow is a multi-tenant project management and team collaboration SaaS built with the MERN stack, Firebase Authentication and Socket.IO. A user can belong to several workspaces with a different role in each, and every workspace's data is isolated at the backend.

> **Status: early foundation, work in progress.** The backend core (auth, workspaces, projects, tasks, real-time rooms) and a small client scaffold are written. Many planned features are not built yet. See [Roadmap](#roadmap) and `PROJECT_PROGRESS.md` for the exact state.

## Table of contents

- [Current status](#current-status)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Roles and permissions](#roles-and-permissions)
- [API reference](#api-reference)
- [Real-time events](#real-time-events)
- [Security model](#security-model)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Deployment notes](#deployment-notes)

## Current status

| Area | State |
|---|---|
| Firebase token verification, user records in MongoDB | Written, not tested against real services |
| Workspaces (create, list, get) | Written, not tested against real services |
| Projects (create, list, get, update, search, pagination) | Written, not tested against real services |
| Tasks (create, update, move, assign, delete) | Written, not tested against real services |
| Socket.IO with authenticated, membership-checked rooms | Written, not tested against real services |
| Permission matrix | Written and unit tested (7 of 7 tests pass) |
| Client: landing, login, register, workspace list | Written, never built |
| Invitations, comments, attachments, notifications | Not built |
| Kanban UI, list, calendar and timeline views | Not built |
| Time tracking, dashboards, analytics, search | Not built |
| Billing, platform admin | Not built |

## Tech stack

**Frontend:** React 18, Vite, React Router, Tailwind CSS, DaisyUI, TanStack Query, Axios, Firebase Auth, Socket.IO client, Sonner, Lucide React.

**Backend:** Node.js, Express, MongoDB native driver, Firebase Admin SDK, Socket.IO, Zod, helmet, cors, express-rate-limit, dotenv.

**Planned:** dnd-kit (Kanban), Recharts (analytics), Cloudinary (uploads), an email provider, Vitest, Supertest and Playwright.

## Project structure

```
taskflow/
├── client/                  React app (Vite)
│   └── src/
│       ├── api/             Axios instance with Firebase token
│       ├── firebase/        Firebase web config
│       ├── pages/           Landing, auth, workspace list
│       ├── providers/       AuthProvider
│       ├── routes/          PrivateRoute
│       └── styles/
├── server/                  Express API
│   ├── config/              env validation, Firebase Admin, MongoDB + indexes
│   ├── middleware/          auth, workspace membership, error handler
│   ├── routes/              REST routes under /api/v1
│   ├── services/            business logic (workspace, project, task, activity)
│   ├── socket/              Socket.IO setup
│   ├── validators/          Zod schemas
│   ├── utilities/           permissions, ids, HTTP errors
│   └── tests/
├── docs/
├── PROJECT_PROGRESS.md
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18.11 or newer (22 recommended)
- A MongoDB Atlas cluster (free tier works)
- A Firebase project with Email/Password and Google sign-in enabled

### 1. Server

```bash
cd server
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
# fill in server/.env, then:
npm run dev
```

The API starts on `http://localhost:5000`. Check `http://localhost:5000/health`, which should return `{"status":"ok"}`.

### 2. Client

```bash
cd client
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
# fill in client/.env, then:
npm run dev
```

The app starts on `http://localhost:5173`.

### 3. Firebase setup

1. Create a project in the Firebase console.
2. Under Authentication, enable **Email/Password** and **Google**. Keep `localhost` in the authorized domains.
3. Under Project settings, Your apps, create a **Web app** and copy its config values into `client/.env`.
4. Under Project settings, Service accounts, choose **Generate new private key**. Copy `project_id`, `client_email` and `private_key` into `server/.env`.

### 4. MongoDB setup

1. Create a cluster and a database user in MongoDB Atlas.
2. Under Network Access, allow your IP address.
3. Click Connect, choose Drivers, and copy the connection string into `MONGODB_URI`, replacing `<password>`.

Indexes are created automatically when the server starts.

## Environment variables

### `server/.env`

| Variable | Required | Notes |
|---|---|---|
| `PORT` | No | Defaults to 5000 |
| `NODE_ENV` | No | `development`, `test` or `production` |
| `MONGODB_URI` | Yes | Atlas connection string |
| `DB_NAME` | No | Defaults to `taskflow` |
| `FIREBASE_PROJECT_ID` | Yes | From the service-account JSON |
| `FIREBASE_CLIENT_EMAIL` | Yes | From the service-account JSON |
| `FIREBASE_PRIVATE_KEY` | Yes | One line, in double quotes, with `\n` kept as is |
| `CLIENT_URL` | Yes | Used for the CORS allowlist, e.g. `http://localhost:5173` |
| `ADMIN_BOOTSTRAP_EMAIL` | No | Reserved for platform admin, not used yet |
| `BILLING_ENABLED` | No | Keep `false` |
| Cloudinary, email, billing keys | No | Placeholders only, not used yet |

Example private key format:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
```

### `client/.env`

| Variable | Notes |
|---|---|
| `VITE_API_URL` | e.g. `http://localhost:5000` |
| `VITE_FIREBASE_API_KEY`, `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._STORAGE_BUCKET`, `..._MESSAGING_SENDER_ID`, `..._APP_ID` | From the Firebase web app config |
| `VITE_APP_NAME` | `TaskFlow` |

Never put backend secrets in the client `.env`. Anything starting with `VITE_` is visible in the browser.

## Roles and permissions

Each user has one role per workspace: `owner`, `manager`, `member` or `guest`. Permissions are checked on the server and denied by default.

| Permission | Guest | Member | Manager | Owner |
|---|:-:|:-:|:-:|:-:|
| Read workspace, projects, tasks | Yes | Yes | Yes | Yes |
| Create and update tasks, comment, track time | | Yes | Yes | Yes |
| Create, update, delete projects | | | Yes | Yes |
| Assign tasks, delete tasks | | | Yes | Yes |
| View team analytics, invite and remove members | | | Yes | Yes |
| Change member roles | | | | Yes |
| Edit or delete workspace, billing | | | | Yes |

Members and guests only see projects they belong to. Owners and managers see every project in the workspace. The last owner of a workspace cannot be removed or demoted.

## API reference

All routes are under `/api/v1` and need an `Authorization: Bearer <Firebase ID token>` header. Responses look like `{ "success": true, "data": ... }`, and errors like `{ "success": false, "message": "..." }`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Health check (no auth, outside `/api/v1`) |
| GET | `/me` | Current user |
| GET | `/workspaces` | Workspaces the user belongs to, with role |
| POST | `/workspaces` | Create a workspace |
| GET | `/workspaces/:workspaceId` | Workspace details |
| GET | `/workspaces/:workspaceId/projects` | List projects (`q`, `status`, `page`, `limit`) |
| POST | `/workspaces/:workspaceId/projects` | Create a project |
| GET | `/workspaces/:workspaceId/projects/:projectId` | Project details |
| PATCH | `/workspaces/:workspaceId/projects/:projectId` | Update a project |
| GET | `/workspaces/:workspaceId/projects/:projectId/tasks` | List tasks (`status`, `q`, `assignee`) |
| POST | `/workspaces/:workspaceId/projects/:projectId/tasks` | Create a task |
| PATCH | `.../tasks/:taskId` | Update a task (send `version` for conflict checks) |
| POST | `.../tasks/:taskId/move` | Change status and position (`beforeTaskId`, `afterTaskId`) |
| PUT | `.../tasks/:taskId/assignees` | Set assignees (must be project members) |
| DELETE | `.../tasks/:taskId` | Delete a task |

A request for a workspace or project you don't belong to returns 404, not 403, so workspace IDs can't be guessed.

## Real-time events

Clients connect with `auth: { token: <Firebase ID token> }`.

| Direction | Event | Payload |
|---|---|---|
| Client to server | `workspace:join` | workspace ID, with an ack `{ ok }` |
| Client to server | `workspace:leave` | workspace ID |
| Server to client | `task:created`, `task:updated`, `task:moved` | the task document |
| Server to client | `task:deleted` | `{ _id }` |

The server only broadcasts after the database write succeeds, and a client can only join workspaces it is a member of.

## Security model

- Identity comes from a verified Firebase ID token. The user's record and platform role are loaded from MongoDB, and any role or user ID sent by the client is ignored.
- Every workspace route checks membership first, and every task and project query includes `workspaceId`.
- Request bodies are validated with strict Zod schemas that reject unknown fields.
- Search text is regex-escaped, and ObjectIds are validated.
- helmet, a CORS allowlist and rate limiting are enabled.
- Task updates use a `version` field so concurrent edits return a 409 conflict instead of overwriting.
- Not built yet: upload validation, invitation tokens, a viewable audit log, and automated cross-workspace isolation tests.

Never commit `.env` files. If a key is ever pushed to GitHub, delete it in Firebase and create a new one.

## Testing

```bash
cd server
npm test        # permission tests, no credentials needed
```

Supertest, Vitest and Playwright suites are planned but not written yet.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Missing/invalid server configuration` | A required value in `server/.env` is empty or missing |
| `Failed to parse private key: Invalid PEM formatted message` | `FIREBASE_PRIVATE_KEY` is a placeholder, truncated, split across lines or missing quotes |
| `MongoServerSelectionError` | Your IP isn't allowed in Atlas Network Access, or the URI or password is wrong |
| `npm error ENOENT package.json` | Run `npm install` inside `server` or `client`, not the root folder |
| Google login popup fails | Add your domain to Firebase authorized domains |
| 401 on every API call | The client isn't sending a valid Firebase token, or the server uses a different Firebase project |

## Roadmap

1. Verify the foundation: install, build the client, test against real MongoDB and Firebase.
2. Supertest tests for authentication and cross-workspace isolation.
3. Invitations and member management.
4. Project members, comments and notifications.
5. Kanban board with dnd-kit, plus list, calendar and timeline views.
6. File uploads with Cloudinary.
7. Time tracking, dashboards and analytics.
8. Global search, billing abstraction and platform admin.
9. Seed script, remaining public pages, deployment configuration.

## Deployment notes

- Frontend: Vercel or Firebase Hosting, with an SPA fallback to `index.html`.
- Backend: a host that supports persistent WebSocket connections (for example Render, Railway or Fly.io). Serverless platforms are not suitable for Socket.IO.
- Database: MongoDB Atlas. Set `CLIENT_URL` on the server to your deployed frontend URL.
- Deployment has not been attempted or verified yet.# taskflow-saas
