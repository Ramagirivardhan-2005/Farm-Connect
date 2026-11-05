/**
 * FarmConnect Real-Time Socket.IO Handler (Instruction 56)
 * Facilitates live tracking room subscriptions and instant status broadcasts.
 */
export function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join order tracking room
    socket.on('subscribe:order', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket.IO] Client ${socket.id} subscribed to order:${orderId}`);
    });

    // Join farmer channel room
    socket.on('subscribe:channel', (channelId) => {
      socket.join(`channel:${channelId}`);
    });

    // Handle real-time tracking update broadcast
    socket.on('order:update_status', ({ orderId, status }) => {
      io.to(`order:${orderId}`).emit('order.status_updated', {
        orderId,
        status,
        timestamp: new Date().toISOString(),
      });
      console.log(`[Socket.IO] Broadcasted status '${status}' to order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

export default setupSocketIO;
