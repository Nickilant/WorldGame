import { cityState } from '../services/cityState.js';

export const attachSockets = (io) => {
  io.on('connection', (socket) => {
    const player = cityState.registerPlayer(socket.id);
    socket.emit('city:snapshot', cityState.toSnapshot());
    io.emit('player:joined', player);

    socket.on('player:move', (position) => {
      cityState.movePlayer(socket.id, position);
      socket.broadcast.emit('player:moved', { id: socket.id, position });
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
