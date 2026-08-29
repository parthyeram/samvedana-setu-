import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';

import authRoutes from './routes/auth.js';
import challengeRoutes from './routes/challenges.js';
import projectRoutes from './routes/projects.js';
import matchingRoutes from './routes/matching.js';
import institutionRoutes from './routes/institutions.js';
import industryRoutes from './routes/industry.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '12mb' }));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`SamvedanaSetu Server running on port ${PORT}`);
});
