const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

// Simple CORS middleware (no external dependency). For this single-app deployment,
// the frontend is served from the same origin, so CORS is only needed for local dev.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = { users: [], sosEvents: [], alerts: [] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8') || '{"users":[],"sosEvents":[],"alerts":[]}');
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

function verifyPassword(password, user) {
  const hash = crypto.pbkdf2Sync(password, user.salt, 10000, 64, 'sha512').toString('hex');
  return hash === user.passwordHash;
}

function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

// Simple in-memory token store (good enough for demo)
const sessions = new Map(); // token -> userId

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [, token] = authHeader.split(' ');
  if (!token || !sessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.userId = sessions.get(token);
  next();
}

// Auth routes
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  const data = loadData();
  if (data.users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  const { salt, hash } = hashPassword(password);
  const user = {
    id: crypto.randomUUID(),
    email,
    salt,
    passwordHash: hash,
    profile: {
      name,
      phone: '',
      email,
    },
    contacts: [],
    safeWords: [],
    settings: {
      threeTap: {
        notifyEmergencyContact: true,
        notifyNearby: true,
        callPolice: true,
      },
      notifications: {
        nearbyAlerts: true,
        detailedPrompt: false,
        sound: false,
        vibration: true,
      },
    },
    lastLocation: null,
  };
  data.users.push(user);
  saveData(data);
  const token = generateToken();
  sessions.set(token, user.id);
  res.json({ token, user: { id: user.id, email: user.email, name: user.profile.name } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const data = loadData();
  const user = data.users.find(u => u.email === email);
  if (!user || !verifyPassword(password, user)) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  const token = generateToken();
  sessions.set(token, user.id);
  res.json({ token, user: { id: user.id, email: user.email, name: user.profile.name } });
});

// Profile
app.get('/api/profile', authMiddleware, (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.profile);
});

app.put('/api/profile', authMiddleware, (req, res) => {
  const { name, phone, email } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.profile = {
    name: name ?? user.profile.name,
    phone: phone ?? user.profile.phone,
    email: email ?? user.profile.email,
  };
  saveData(data);
  res.json(user.profile);
});

// Contacts
app.get('/api/contacts', authMiddleware, (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.contacts);
});

app.post('/api/contacts', authMiddleware, (req, res) => {
  const { name, relationship, phone, email, shareLocation } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const contact = {
    id: crypto.randomUUID(),
    name,
    relationship: relationship || '',
    phone,
    email: email || '',
    shareLocation: !!shareLocation,
  };
  user.contacts.push(contact);
  saveData(data);
  res.status(201).json(contact);
});

app.put('/api/contacts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, relationship, phone, email, shareLocation } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const contact = user.contacts.find(c => c.id === id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  contact.name = name;
  contact.relationship = relationship || '';
  contact.phone = phone;
  contact.email = email || '';
  contact.shareLocation = !!shareLocation;
  saveData(data);
  res.json(contact);
});

app.delete('/api/contacts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.contacts = user.contacts.filter(c => c.id !== id);
  saveData(data);
  res.status(204).end();
});

app.put('/api/contacts/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { name, relationship, phone, email, shareLocation } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const contactIndex = user.contacts.findIndex(c => c.id === id);
  if (contactIndex === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }
  user.contacts[contactIndex] = {
    ...user.contacts[contactIndex],
    name,
    relationship: relationship || '',
    phone,
    email: email || '',
    shareLocation: !!shareLocation,
  };
  saveData(data);
  res.json(user.contacts[contactIndex]);
});

// Safe words
app.get('/api/safe-words', authMiddleware, (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.safeWords);
});

app.post('/api/safe-words', authMiddleware, (req, res) => {
  const { word, notifyEmergencyContact, notifyNearby, callPolice, activate } = req.body;
  if (!word) return res.status(400).json({ error: 'Word is required' });
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safeWord = {
    id: crypto.randomUUID(),
    word,
    notifyEmergencyContact: !!notifyEmergencyContact,
    notifyNearby: !!notifyNearby,
    callPolice: !!callPolice,
    activate: activate !== undefined ? !!activate : true,
  };
  user.safeWords.push(safeWord);
  saveData(data);
  res.status(201).json(safeWord);
});

app.put('/api/safe-words/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const safeWord = user.safeWords.find(w => w.id === id);
  if (!safeWord) return res.status(404).json({ error: 'Safe word not found' });
  Object.assign(safeWord, req.body);
  saveData(data);
  res.json(safeWord);
});

app.delete('/api/safe-words/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.safeWords = user.safeWords.filter(w => w.id !== id);
  saveData(data);
  res.status(204).end();
});

// Settings
app.get('/api/settings', authMiddleware, (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.settings);
});

app.put('/api/settings', authMiddleware, (req, res) => {
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.settings = {
    ...user.settings,
    ...req.body,
  };
  saveData(data);
  res.json(user.settings);
});

// Location update (for nearby alerts)
app.post('/api/location', authMiddleware, (req, res) => {
  const { lat, lng } = req.body;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'lat and lng must be numbers' });
  }
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.lastLocation = { lat, lng, timestamp: Date.now() };
  saveData(data);
  res.json({ ok: true, lastLocation: user.lastLocation });
});

// Distance helper (Haversine)
function distanceInMiles(lat1, lon1, lat2, lon2) {
  function toRad(v) { return (v * Math.PI) / 180; }
  const R = 3958.8; // miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// SOS + alerts
app.post('/api/sos', authMiddleware, (req, res) => {
  const { lat, lng, type, locationText } = req.body; // type: '3-tap' or 'safe-word'
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'lat and lng must be numbers' });
  }
  const data = loadData();
  const user = data.users.find(u => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const timestamp = Date.now();
  user.lastLocation = { lat, lng, timestamp };

  // Determine which actions are enabled based on settings and safe words
  const isThreeTap = (type || '3-tap') === '3-tap';
  const threeTapSettings = user.settings?.threeTap || {};
  const activeSafeWords = (user.safeWords || []).filter(w => w.activate);

  const senderNotifyNearby = isThreeTap
    ? threeTapSettings.notifyNearby !== false
    : activeSafeWords.some(w => w.notifyNearby);

  const senderNotifyEmergencyContact = isThreeTap
    ? threeTapSettings.notifyEmergencyContact !== false
    : activeSafeWords.some(w => w.notifyEmergencyContact);

  const senderCallPolice = isThreeTap
    ? threeTapSettings.callPolice !== false
    : activeSafeWords.some(w => w.callPolice);

  const sosEvent = {
    id: crypto.randomUUID(),
    userId: user.id,
    lat,
    lng,
    type: type || '3-tap',
    locationText: locationText || '',
    actions: {
      notifyNearby: senderNotifyNearby,
      notifyEmergencyContact: senderNotifyEmergencyContact,
      callPolice: senderCallPolice,
    },
    timestamp,
  };
  data.sosEvents.push(sosEvent);

  // Generate alerts for nearby users (within 1 mile) only if sender allows "notify nearby"
  if (senderNotifyNearby) {
  const radiusMiles = 1;
  data.users.forEach(other => {
    if (other.id === user.id) return;
    if (!other.lastLocation) return;
    const noti = other.settings?.notifications;
    if (noti && noti.nearbyAlerts === false) return;
    const d = distanceInMiles(lat, lng, other.lastLocation.lat, other.lastLocation.lng);
    if (d <= radiusMiles) {
      data.alerts.push({
        id: crypto.randomUUID(),
        userId: other.id,
        fromUserId: user.id,
        lat,
        lng,
        distanceMiles: d,
        type: sosEvent.type,
        timestamp,
        status: 'new',
      });
    }
  });
  }

  saveData(data);
  res.json({ ok: true, sosEvent });
});

app.get('/api/alerts', authMiddleware, (req, res) => {
  const data = loadData();
  const alerts = data.alerts.filter(a => a.userId === req.userId && a.status === 'new');
  // mark as delivered
  alerts.forEach(a => { a.status = 'delivered'; });
  saveData(data);
  res.json(alerts);
});

// SOS history for current user
app.get('/api/history', authMiddleware, (req, res) => {
  const data = loadData();
  const events = data.sosEvents.filter(e => e.userId === req.userId);
  res.json(events);
});

// Serve built frontend (Vite build output in /dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// SPA fallback: let React Router handle non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SilentSOS app (API + frontend) listening on http://localhost:${PORT}`);
});

