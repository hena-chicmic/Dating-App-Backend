const onlineUsers = require('./online-users');
const matchRepository = require('../repositories/match.repository');
const callService = require('../services/call.service');

const activeCalls = new Map(); // callId -> { timeout, answered, startedAt }

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

            // Create initial log
            const callId = await callService.startCall(matchId, callerId, targetUserId);

            // 45s Timeout for "Missed" logic
            const timeout = setTimeout(async () => {
                const call = activeCalls.get(callId);
                if (call && !call.answered) {
                    await callService.updateStatus(callId, 'missed');
                    activeCalls.delete(callId);
                    io.to(targetSocketId).emit('call_ended', { matchId, reason: 'timeout' });
                    socket.emit('call_failed', { message: 'User did not answer.' });
                }
            }, 45000);

            activeCalls.set(callId, { timeout, answered: false });

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

            const call = activeCalls.get(callId);
            if (call) {
                clearTimeout(call.timeout);
                call.answered = true;
                call.startedAt = new Date();
                activeCalls.set(callId, call);
                
                await callService.updateStatus(callId, 'ongoing');
            }

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

            const call = activeCalls.get(callId);
            if (call) {
                await callService.updateStatus(callId, 'completed', call.startedAt);
                activeCalls.delete(callId);
            }

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
            const call = activeCalls.get(callId);
            if (call) {
                clearTimeout(call.timeout);
                activeCalls.delete(callId);
            }

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
};
