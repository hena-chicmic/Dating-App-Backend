const onlineUsers = require('./online-users');
const matchRepository = require('../repositories/match.repository');

module.exports = (socket, io) => {

    socket.on('call_user', async ({ targetUserId, matchId, offer }) => {
        const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
        if (!authorized) return;

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
        const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
        if (!authorized) return;

        const callerSocketId = await onlineUsers.get(parseInt(callerId));
        if (!callerSocketId) return;

        io.to(callerSocketId).emit('call_answered', {
            answererId: socket.userId,
            matchId,
            answer,
        });
    });

    socket.on('ice_candidate', async ({ targetUserId, matchId, candidate }) => {
        const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
        if (!authorized) return;

        const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
        if (!targetSocketId) return;

        io.to(targetSocketId).emit('ice_candidate', {
            from: socket.userId,
            matchId,
            candidate,
        });
    });

    socket.on('call_end', async ({ targetUserId, matchId }) => {
        const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
        if (!authorized) return;

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
