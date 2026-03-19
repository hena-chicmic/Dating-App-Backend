const onlineUsers = require('./online-users');

module.exports = (socket, io) => {

    socket.on('call_user', ({ targetUserId, matchId, offer }) => {
        const targetSocketId = onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) {
            return socket.emit('call_failed', { message: 'User is not online.' });
        }

        io.to(targetSocketId).emit('incoming_call', {
            callerId: socket.userId,
            matchId,
            offer,
        });
    });

    socket.on('call_answer', ({ callerId, matchId, answer }) => {
        const callerSocketId = onlineUsers.get(parseInt(callerId));
        if (!callerSocketId) return;

        io.to(callerSocketId).emit('call_answered', {
            answererId: socket.userId,
            matchId,
            answer,
        });
    });

    socket.on('ice_candidate', ({ targetUserId, candidate }) => {
        const targetSocketId = onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit('ice_candidate', {
            from: socket.userId,
            candidate,
        });
    });

    socket.on('call_end', ({ targetUserId, matchId }) => {
        const targetSocketId = onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit('call_ended', {
            by: socket.userId,
            matchId,
        });
    });

    socket.on('call_reject', ({ callerId, matchId }) => {
        const callerSocketId = onlineUsers.get(parseInt(callerId));
        if (!callerSocketId) return;

        io.to(callerSocketId).emit('call_rejected', {
            by: socket.userId,
            matchId,
        });
    });
};
