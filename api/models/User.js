import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, default: '' },
  email: { type: String, default: '' },
  age: { type: String, default: '' },
  gender: { type: String, default: 'Prefer not to say' },
  bloodGroup: { type: String, default: '' },
  allergies: { type: [String], default: [] },
  diseases: { type: [String], default: [] },
  medications: { type: Array, default: [] },
  coins: { type: Number, default: 100 },
  streak: { type: Number, default: 0 },
  onboarded: { type: Boolean, default: false },
  vitals: { type: Array, default: [] },
  history: { type: Array, default: [] },
  notifications: { type: Array, default: [] },
  settings: { type: Object, default: {} },
  emergencyContact: { type: Object, default: {} }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
