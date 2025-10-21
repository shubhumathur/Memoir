import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import journalRoutes from './routes/journal.js';
import chatRoutes from './routes/chat.js';
import sentimentRoutes from './routes/sentiment.js';
import insightsRoutes from './routes/insights.js';
import settingsRoutes from './routes/settings.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/memoir';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Mongo connected'))
  .catch((err) => {
    console.warn('Mongo not available, running in demo mode:', err.message);
  });

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'memoir-backend' });
});

app.use('/auth', authRoutes);
app.use('/journal', journalRoutes);
app.use('/chat', chatRoutes);
app.use('/sentiment', sentimentRoutes);
app.use('/insights', insightsRoutes);
app.use('/settings', settingsRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));



