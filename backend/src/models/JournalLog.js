import mongoose from 'mongoose';

const JournalLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    sentiment: { type: String },
    emotions: { type: [String], default: [] },
    keywords: { type: [String], default: [] },
    mood: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model('JournalLog', JournalLogSchema);



