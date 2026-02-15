import mongoose from 'mongoose';

const avatarSchema = new mongoose.Schema(
  {
    skin: { type: String, default: '#f1c27d' },
    hair: { type: String, default: '#2d1c13' },
    shirt: { type: String, default: '#4d9eff' },
    pants: { type: String, default: '#2c3e50' }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: avatarSchema, default: () => ({}) }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
