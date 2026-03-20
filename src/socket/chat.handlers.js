const messageService = require('../services/message.service');
const onlineUsers = require('./online-users');
const { addNotificationJob } = require('../queues');
const matchRepository = require('../repositories/match.repository');

module.exports = (socket, io) => {

    socket.on('join_match_room', async ({ matchId }) => {
        try {
            const userId = socket.userId;
            const authorized = await matchRepository.isUserInMatch(userId, matchId);
            
            if (!authorized) {
                return socket.emit('error', { message: 'Unauthorized access to this chat.' });
            }

            const room = `match_${matchId}`;
            socket.join(room);
            console.log(`Socket ${socket.id} (User ${userId}) joined room: ${room}`);
        } catch (err) {
            socket.emit('error', { message: 'Failed to join chat room.' });
        }
    });

    socket.on('send_message', async ({ matchId, text, mediaUrl = null, mediaType = null }) => {
        try {
            const senderId = socket.userId;
            if (!senderId) return socket.emit('error', { message: 'Not authenticated.' });

            const authorized = await matchRepository.isUserInMatch(senderId, matchId);
            if (!authorized) {
                return socket.emit('error', { message: 'You are not a participant in this match.' });
            }

            const savedMessage = await messageService.sendMessage(matchId, senderId, text, mediaUrl, mediaType);

            io.to(`match_${matchId}`).emit('receive_message', savedMessage);

            try {
                const partner = await matchRepository.getPartner(matchId, senderId);
                if (partner) {
                    await addNotificationJob(partner.id, 'new_message', matchId, `New message from ${partner.username}`);
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
