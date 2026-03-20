const onlineUsers = require('./online-users');

module.exports = (socket, io) => {

    socket.on('call_user', async ({ targetUserId, matchId, offer }) => {
        const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) {
            return socket.emit('call_failed', { message: 'User is not online.' });
        }

        io.to(targetSocketId).emit('incoming_call', {
            callerId: socket.userId,
            matchId,
            offer,
        });
    });

    socket.on('call_answer', async ({ callerId, matchId, answer }) => {
        const callerSocketId = await onlineUsers.get(parseInt(callerId));
        if (!callerSocketId) return;

        io.to(callerSocketId).emit('call_answered', {
            answererId: socket.userId,
            matchId,
            answer,
        });
    });

    socket.on('ice_candidate', async ({ targetUserId, candidate }) => {
        const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit('ice_candidate', {
            from: socket.userId,
            candidate,
        });
    });

    socket.on('call_end', async ({ targetUserId, matchId }) => {
        const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit('call_ended', {
            by: socket.userId,
            matchId,
        });
    });

    socket.on('call_reject', async ({ callerId, matchId }) => {
        const callerSocketId = await onlineUsers.get(parseInt(callerId));
        if (!callerSocketId) return;

        io.to(callerSocketId).emit('call_rejected', {
            by: socket.userId,
            matchId,
        });
    });
};
