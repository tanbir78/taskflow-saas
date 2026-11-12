import { Server } from 'socket.io';
import { firebaseAuth } from '../config/firebase.js';
import { col } from '../config/db.js';
import { env } from '../config/env.js';
import { toObjectId } from '../utilities/ids.js';

let io;

export const emitToWorkspace = (workspaceId, event, payload) => {
  // Call only after successful database operations.
  io?.to(`ws:${workspaceId}`).emit(event, payload);
};

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || '';

      const decoded = await firebaseAuth.verifyIdToken(token);

      const user = await col('users').findOne({
        firebaseUid: decoded.uid,
        status: 'active',
      });

      if (!user) {
        return next(new Error('unauthorized'));
      }

      socket.data.user = user;

      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  // Handle client connections
  io.on('connection', (socket) => {

    // Join workspace room
    socket.on('workspace:join', async (workspaceId, ack) => {
      try {
        const id = toObjectId(workspaceId, 'workspaceId');

        const member = await col('workspaceMembers').findOne({
          workspaceId: id,
          userId: socket.data.user._id,
        });

        if (!member) {
          // Prevent unauthorized room access.
          return ack?.({
            ok: false,
            error: 'forbidden',
          });
        }

        await socket.join(`ws:${id}`);

        ack?.({
          ok: true,
        });
      } catch {
        ack?.({
          ok: false,
          error: 'invalid',
        });
      }
    });

    // Leave workspace room
    socket.on('workspace:leave', (workspaceId) => {
      if (typeof workspaceId === 'string') {
        socket.leave(`ws:${workspaceId}`);
      }
    });
  });

  return io;
}


