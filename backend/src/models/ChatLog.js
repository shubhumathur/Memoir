import mongoose from 'mongoose';

const ChatLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    persona: { type: String, enum: ['mentor', 'coach', 'psychologist'], default: 'mentor' },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant'], required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('ChatLog', ChatLogSchema);
