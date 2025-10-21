import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import JournalLog from './models/JournalLog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/memoir';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to Mongo');

  await User.deleteMany({ email: 'demo@memoir.app' });
  await JournalLog.deleteMany({});

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const user = await User.create({
    username: 'demo',
    email: 'demo@memoir.app',
    passwordHash,
    persona: 'mentor',
    privacySettings: { localOnly: false },
    theme: 'light',
  });

  const entries = [
    {
      userId: user._id,
      date: new Date(),
      content: 'Felt calm after a long walk. Coffee with a friend lifted my mood.',
      sentiment: 'Positive',
      emotions: ['Joy','Calm'],
      keywords: ['calm','walk','coffee','friend','mood'],
    },
    {
      userId: user._id,
      date: new Date(Date.now()-86400000),
      content: 'Anxious about looming deadline at work but completed key tasks.',
      sentiment: 'Neutral',
      emotions: ['Anxiety'],
      keywords: ['anxious','deadline','work','tasks'],
    },
    {
      userId: user._id,
      date: new Date(Date.now()-2*86400000),
      content: 'Tired, but journaling helped me process my day.',
      sentiment: 'Positive',
      emotions: ['Calm'],
      keywords: ['tired','journaling','process'],
    }
  ];

  await JournalLog.insertMany(entries);
  console.log('Seeded demo user and journals.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});






