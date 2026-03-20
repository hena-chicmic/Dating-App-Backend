const onlineUsers = require('./online-users');
const matchRepository = require('../repositories/match.repository');
const callService = require('../services/call.service');

module.exports = (socket, io) => {

    socket.on('call_user', async ({ targetUserId, matchId, offer }) => {
        try {
            const callerId = socket.userId;
            const authorized = await matchRepository.isUserInMatch(callerId, matchId);
            if (!authorized) return;

            const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
            if (!targetSocketId) {
                return socket.emit('call_failed', { message: 'User is not online.' });
            }

            const callId = await callService.startCall(matchId, callerId, targetUserId);

            io.to(targetSocketId).emit('incoming_call', {
                callId,
                callerId,
                matchId,
                offer,
            });
        } catch (err) {
            console.error('call_user error:', err.message);
            socket.emit('call_failed', { message: 'Failed to initiate call.' });
        }
    });

    socket.on('call_answer', async ({ callId, callerId, matchId, answer }) => {
        try {
            const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
            if (!authorized) return;

            await callService.updateStatus(callId, 'ongoing');

            const callerSocketId = await onlineUsers.get(parseInt(callerId));
            if (callerSocketId) {
                io.to(callerSocketId).emit('call_answered', {
                    answererId: socket.userId,
                    matchId,
                    answer,
                });
            }
        } catch (err) {
            console.error('call_answer error:', err.message);
        }
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

    socket.on('call_end', async ({ callId, targetUserId, matchId }) => {
        try {
            const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
            if (!authorized) return;

            await callService.updateStatus(callId, 'completed');

            const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
            if (targetSocketId) {
                io.to(targetSocketId).emit('call_ended', {
                    by: socket.userId,
                    matchId,
                });
            }
        } catch (err) {
            console.error('call_end error:', err.message);
        }
    });

    socket.on('call_reject', async ({ callId, callerId, matchId }) => {
        try {
            await callService.updateStatus(callId, 'rejected');

            const callerSocketId = await onlineUsers.get(parseInt(callerId));
            if (callerSocketId) {
                io.to(callerSocketId).emit('call_rejected', {
                    by: socket.userId,
                    matchId,
                });
            }
        } catch (err) {
            console.error('call_reject error:', err.message);
        }
    });

    socket.on('call_cancel', async ({ callId, targetUserId, matchId }) => {
        // Triggered by frontend timeout logic (e.g. 45s passed) or caller hanging up early
        try {
            const authorized = await matchRepository.isUserInMatch(socket.userId, matchId);
            if (!authorized) return;

            await callService.updateStatus(callId, 'missed');

            const targetSocketId = await onlineUsers.get(parseInt(targetUserId));
            if (targetSocketId) {
                io.to(targetSocketId).emit('call_ended', {
                    by: socket.userId,
                    matchId,
                    reason: 'timeout_or_cancelled'
                });
            }
        } catch (err) {
            console.error('call_cancel error:', err.message);
        }
    });
};
