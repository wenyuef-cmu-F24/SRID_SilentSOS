## SilentSOS App

A discreet emergency alert application with two activation methods:
1. **3-Tap Mode**: Tap the SOS button 3 times to trigger alert
2. **Safe Word Mode**: Say your custom help word to activate

### Operation Instructions

From the project root `SRID_SilentSOS`:

- **Install dependencies (first time only)**:

```bash
npm install
```

- **Start the backend API server** (port `4000`):

```bash
npm run server
```

- **Start the frontend (Vite + React)** in a second terminal (default port `5173`):

```bash
npm run dev
```

- Open the app in your browser at `http://localhost:5173/`.
- Sign up with a **username + password**, then log in to access the Home screen.

### Technology Stack

- **Frontend**
  - React 18 (functional components + hooks)
  - React Router 6 (navigation and nested routes)
  - Tailwind CSS 3 (responsive styling)
  - Vite 5 (dev server and build tooling)

- **Backend**
  - Node.js + Express (lightweight REST API)
  - File-based JSON storage (`data.json`) for users, settings, SOS events, and alerts
  - Simple token-based sessions kept in memory (per server process)

### Limitations

- **Demo data store**
  - Uses a local JSON file instead of a real database; not suitable for production or multi-instance deployments.
  - Sessions are in-memory, so all logins are lost when the server restarts.

- **Location & alerts**
  - Relies on browser geolocation; if permission is denied, SOS will not include precise coordinates.
  - “Notify emergency contact” and “Call police” are **UI-only** and do not actually send SMS, calls, or integrate with 911.

- **Voice / safe word**
  - Safe word mode is currently simulated; there is no real microphone/voice recognition, only demo behavior.

- **Security & robustness**
  - Passwords are hashed with PBKDF2, but there is no full production-grade auth (no refresh tokens, forgot password flow, etc.).
  - No rate limiting or advanced input validation has been added yet.
