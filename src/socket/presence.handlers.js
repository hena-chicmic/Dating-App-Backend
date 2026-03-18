const onlineUsers = require('./online-users');
const matchRepository = require('../repositories/match.repository');

module.exports = (socket, io) => {

    socket.on('user_online', async (userId) => {
        userId = parseInt(userId);
        // REDIS FIX: onlineUsers.set is now async
        await onlineUsers.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${userId} is online (socket: ${socket.id})`);

        try {
            const matches = await matchRepository.fetchUserMatches(userId);

            // REDIS FIX: Need to await the 'has' check for each match
            const onlineMatchIds = [];
            for (const m of matches) {
                if (await onlineUsers.has(m.user_id)) {
                    onlineMatchIds.push(m.user_id);
                }
            }

            socket.emit('online_status', { onlineUsers: onlineMatchIds });

            // REDIS FIX: Await get() for each match
            for (const match of matches) {
                const matchSocketId = await onlineUsers.get(match.user_id);
                if (matchSocketId) {
                    io.to(matchSocketId).emit('friend_online', { userId });
                }
            }
        } catch (err) {
            console.error('Error in user_online:', err.message);
        }
    });


    socket.on('disconnect', async () => {
        const userId = socket.userId;
        if (!userId) return;

        // REDIS FIX: onlineUsers.delete is now async
        await onlineUsers.delete(userId);
        console.log(`User ${userId} is offline`);

        try {
            const matches = await matchRepository.fetchUserMatches(userId);
            for (const match of matches) {
                const matchSocketId = await onlineUsers.get(match.user_id);
                if (matchSocketId) {
                    io.to(matchSocketId).emit('friend_offline', { userId });
                }
            }
        } catch (err) {
            console.error('Error in disconnect presence:', err.message);
        }
    });
};
