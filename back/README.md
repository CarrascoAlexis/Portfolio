# Portfolio Backend

Express + Socket.IO backend scaffold for the Portfolio project. Designed for real-time chat/game usage with an optional Redis storage adapter and an in-memory fallback.

Quick start

1. Install deps:

```powershell
cd back; npm install
```

2. Run (development):

```powershell
cd back; npm run dev
```

3. Environment variables (optional):

- `REDIS_URL` - if provided, the server will connect to Redis for storage.
- `PORT` - server port (default 4000).

Endpoints

- `GET /api/health` - health check
- `GET /api/messages?room=<room>` - list recent messages

Socket.IO

- Namespaces/rooms will be used for game/chat rooms. Events:
  - `join` {room, user}
  - `message` {room, user, text}
