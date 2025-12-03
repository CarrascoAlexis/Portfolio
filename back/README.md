# Portfolio Backend

Express + Socket.IO backend scaffold for the Portfolio project. Designed for real-time chat/game usage with **SQLite persistent storage** for projects, images, and settings. Messages and games are kept in-memory for real-time performance.

## Quick start

1. Install deps:

```powershell
cd back; npm install
```

2. Run (development):

```powershell
cd back; npm run dev
```

3. Environment variables (optional):

- `REDIS_URL` - if provided, the server will use Redis instead of SQLite.
- `USE_SQLITE` - set to `false` to disable SQLite (default: `true`).
- `PORT` - server port (default 4000).
- `GITHUB_USERNAME` - your GitHub username for fetching repositories.
- `GITHUB_TOKEN` - GitHub personal access token (optional, for higher rate limits).

## Storage

### SQLite (Default)

The application uses SQLite by default for persistent storage of:
- **Manual projects** - custom projects created in the admin panel
- **Project visibility** - which projects are visible/hidden
- **Images metadata** - uploaded images, their project associations, and primary image flags

Database file: `back/data/portfolio.db`

Real-time features (messages, games) remain in-memory for performance.

### Redis (Optional)

Set `REDIS_URL` environment variable to use Redis for all storage instead of SQLite.

### In-Memory Fallback

If both SQLite and Redis are disabled, data will be stored in memory only (not persistent).

Endpoints

- `GET /api/health` - health check
- `GET /api/messages?room=<room>` - list recent messages
- `GET /api/projects` - list all projects (GitHub + manual)
- `GET /api/images?project=<key>` - get images for a project

Socket.IO

- Namespaces/rooms will be used for game/chat rooms. Events:
  - `join` {room, user}
  - `message` {room, user, text}
