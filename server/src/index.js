import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import learningRoutes from './routes/learning.js';
import tutorRoutes from './routes/tutor.js';
import teacherRoutes from './routes/teacher.js';
import gamesRoutes from './routes/games.js';
import i18nRoutes from './routes/i18n.js';
import communityRoutes from './routes/community.js';
import { attachStudyRoomSockets } from './community-sockets.js';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;
attachStudyRoomSockets(httpServer);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', name: 'GyaanDhara API', version: '1.0.0', dataStore: db.mode });
});

app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/i18n', i18nRoutes);
app.use('/api/community', communityRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'Internal server error' });
});

const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Not found' });
  });
});

db.connect()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`GyaanDhara API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exitCode = 1;
  });
