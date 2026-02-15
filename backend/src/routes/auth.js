import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User.js';

const router = express.Router();
const memoryUsers = new Map();

const signToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, name required' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  if (mongoose.connection.readyState === 1) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'User already exists' });
    const user = await User.create({ email, passwordHash, name });
    const token = signToken({ sub: user._id.toString(), email, name, guest: false, isNew: true });
    return res.json({ token, isNew: true, profile: { email, name, avatar: user.avatar } });
  }

  if (memoryUsers.has(email)) return res.status(409).json({ error: 'User already exists' });
  memoryUsers.set(email, { email, passwordHash, name, avatar: null });
  const token = signToken({ sub: email, email, name, guest: false, isNew: true });
  return res.json({ token, isNew: true, profile: { email, name, avatar: null } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  if (mongoose.connection.readyState === 1) {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ sub: user._id.toString(), email, name: user.name, guest: false, isNew: false });
    return res.json({ token, isNew: false, profile: { email, name: user.name, avatar: user.avatar } });
  }

  const user = memoryUsers.get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken({ sub: email, email, name: user.name, guest: false, isNew: false });
  return res.json({ token, isNew: false, profile: { email, name: user.name, avatar: user.avatar } });
});

router.post('/avatar', async (req, res) => {
  const { token, avatar } = req.body || {};
  if (!token || !avatar) return res.status(400).json({ error: 'token and avatar required' });

  const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  if (mongoose.connection.readyState === 1 && payload.sub) {
    await User.findByIdAndUpdate(payload.sub, { $set: { avatar } }, { new: true });
  } else if (payload.email && memoryUsers.has(payload.email)) {
    const user = memoryUsers.get(payload.email);
    user.avatar = avatar;
  }

  res.json({ ok: true });
});

router.post('/guest', (req, res) => {
  const guestName = req.body?.name || `Guest-${Math.floor(Math.random() * 9999)}`;
  const token = signToken({ name: guestName, guest: true, isNew: false });
  res.json({ token, guestName });
});

export default router;
