import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    completedDates: [{ type: Date }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Habit', HabitSchema);

