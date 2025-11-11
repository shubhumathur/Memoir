import mongoose from 'mongoose';

const PrivacySettingsSchema = new mongoose.Schema(
  {
    localOnly: { type: Boolean, default: false },
  },
  { _id: false }
);

const OnboardingSchema = new mongoose.Schema(
  {
    age: Number,
    sleepHours: Number,
    activityLevel: String,
    hobbies: [String],
    preferredTime: String,
    moodAvg: Number,
    stressLevel: Number,
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    persona: { type: String, enum: ['mentor', 'coach', 'psychologist'], default: 'mentor' },
    privacySettings: { type: PrivacySettingsSchema, default: () => ({}) },
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    onboarding: { type: OnboardingSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);



