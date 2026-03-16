const messageService = require('../services/message.service');
const onlineUsers = require('./online-users');

module.exports = (socket, io) => {

   
    socket.on('join_match_room', ({ matchId }) => {
        const room = `match_${matchId}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    
    socket.on('send_message', async ({ matchId, text, mediaUrl = null, mediaType = null }) => {
        try {
            const senderId = socket.userId;
            if (!senderId) return socket.emit('error', { message: 'Not authenticated.' });

            const savedMessage = await messageService.sendMessage(matchId, senderId, text, mediaUrl, mediaType);

            io.to(`match_${matchId}`).emit('receive_message', savedMessage);

        } catch (err) {
            console.error('send_message error:', err.message);
            socket.emit('error', { message: err.message });
        }
    });


    socket.on('mark_read', async ({ matchId }) => {
        try {
            const receiverId = socket.userId;
            if (!receiverId) return;

            await messageService.markRead(matchId, receiverId);

            io.to(`match_${matchId}`).emit('messages_read', {
                matchId,
                readBy: receiverId,
            });
        } catch (err) {
            console.error('mark_read error:', err.message);
        }
    });

    
    socket.on('typing', ({ matchId }) => {
        socket.to(`match_${matchId}`).emit('user_typing', {
            userId: socket.userId,
            matchId,
        });
    });

    socket.on('stop_typing', ({ matchId }) => {
        socket.to(`match_${matchId}`).emit('user_stop_typing', {
            userId: socket.userId,
            matchId,
        });
    });


    socket.on('leave_match_room', ({ matchId }) => {
        const room = `match_${matchId}`;
        socket.leave(room);
        console.log(`Socket ${socket.id} left room: ${room}`);
    });
};
