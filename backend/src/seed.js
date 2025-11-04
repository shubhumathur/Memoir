import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import JournalLog from './models/JournalLog.js';
import Habit from './models/Habit.js';

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
  
  // Add demo habits
  const habits = [
    {
      userId: user._id,
      name: 'Morning Meditation',
      description: '10 minutes of mindfulness meditation',
      streak: 5,
      longestStreak: 7,
      completedDates: [
        new Date(),
        new Date(Date.now() - 86400000),
        new Date(Date.now() - 2 * 86400000),
        new Date(Date.now() - 3 * 86400000),
        new Date(Date.now() - 4 * 86400000),
      ],
    },
    {
      userId: user._id,
      name: 'Daily Journaling',
      description: 'Write at least one journal entry per day',
      streak: 3,
      longestStreak: 10,
      completedDates: [
        new Date(),
        new Date(Date.now() - 86400000),
        new Date(Date.now() - 2 * 86400000),
      ],
    },
    {
      userId: user._id,
      name: 'Evening Walk',
      description: '30-minute walk in the evening',
      streak: 2,
      longestStreak: 5,
      completedDates: [
        new Date(),
        new Date(Date.now() - 86400000),
      ],
    },
  ];
  
  await Habit.insertMany(habits);
  console.log('Seeded demo user, journals, and habits.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});






