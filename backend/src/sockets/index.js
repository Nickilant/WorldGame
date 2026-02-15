import jwt from 'jsonwebtoken';
import { cityState } from '../services/cityState.js';

const parseAuth = (socket) => {
  const token = socket.handshake.auth?.token;
  if (!token) return { name: `Guest-${socket.id.slice(-4)}`, guest: true };
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return {
      name: payload.name || payload.email || `User-${socket.id.slice(-4)}`,
      accountId: payload.sub || null,
      avatar: socket.handshake.auth?.avatar || null,
      guest: Boolean(payload.guest)
    };
  } catch (_error) {
    return { name: `Guest-${socket.id.slice(-4)}`, guest: true };
  }
};

export const attachSockets = (io) => {
  io.on('connection', (socket) => {
    const profile = parseAuth(socket);
    const player = cityState.registerPlayer(socket.id, profile);
    socket.emit('city:snapshot', cityState.toSnapshot());
    io.emit('player:joined', player);

    socket.on('player:move', (position) => {
      cityState.movePlayer(socket.id, position);
      io.emit('player:moved', { id: socket.id, position: cityState.players.get(socket.id)?.position });
    });

    socket.on('plot:buy', ({ x, z }) => {
      const result = cityState.buyPlot(socket.id, x, z);
      socket.emit('plot:buy:result', result);
      if (result.ok) io.emit('city:snapshot', cityState.toSnapshot());
    });

    socket.on('building:place', (payload) => {
      const result = cityState.placeBuilding(socket.id, payload);
      socket.emit('building:place:result', result);
      if (result.ok) io.emit('city:snapshot', cityState.toSnapshot());
    });

    socket.on('disconnect', () => {
      cityState.removePlayer(socket.id);
      io.emit('player:left', { id: socket.id });
    });
  });
};
