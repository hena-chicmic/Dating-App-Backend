const messageService = require('../services/message.service');
const onlineUsers = require('./online-users');
const { addNotificationJob } = require('../queues/notification.queue');
const matchRepository = require('../repositories/match.repository');

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

           
            try {
                
                const match = (await matchRepository.fetchUserMatches(senderId)).find(m => m.match_id === parseInt(matchId));
                if (match) {
                    await addNotificationJob(match.user_id, 'new_message', matchId, `New message from ${match.username}`);
                }
            } catch (err) {
                console.error('Notification error on send_message:', err.message);
            }

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
