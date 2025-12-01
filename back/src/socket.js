const { Server } = require('socket.io');
const storage = require('./services/storage');

function initSocket(server) {
  const io = new Server(server, { cors: { origin: '*' } });

  io.on('connection', (socket) => {
    socket.on('join', ({ room, user } = {}) => {
      const r = room || 'global';
      socket.join(r);
      socket.data.user = user || { id: socket.id };
      socket.emit('joined', { room: r });
    });

    socket.on('message', async (payload) => {
      const { room = 'global', user = { id: socket.id }, text } = payload || {};
      if (!text) return;
      const msg = { user, text, ts: Date.now() };
      await storage.saveMessage(room, msg);
      io.to(room).emit('message', { room, message: msg });
    });

    socket.on('disconnect', () => {});
  });
}

module.exports = { initSocket };
