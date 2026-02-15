import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/guest', (req, res) => {
  const guestName = req.body?.name || `Guest-${Math.floor(Math.random() * 9999)}`;
  const token = jwt.sign({ name: guestName, guest: true }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: '7d'
  });

  res.json({ token, guestName });
});

export default router;
