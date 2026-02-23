Node.js API setup

1. Install server dependencies (run in project root):

```powershell
npm install express cors
```

2. Start the API:

```powershell
npm run start-api
```

This will start the attendance API on http://localhost:3000 and expose the same endpoints (e.g. POST /api/attendance.php) used by the frontend.

Notes:
- The server writes data to `data/attendance.json` in the project root.
- If you previously relied on PHP, point to the Node server (same paths are implemented for compatibility).
