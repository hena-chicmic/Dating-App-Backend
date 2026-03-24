const onlineUsers = require('./online-users');
const matchRepository = require('../repositories/match.repository');
const logger = require('../utils/logger');

module.exports = (socket, io) => {

    socket.on('user_online', async () => {
        const userId = socket.userId;
        if (!userId) {
            return socket.emit('error', { message: 'Authentication required for presence.' });
        }

        await onlineUsers.set(userId, socket.id);
        logger.info(`User ${userId} is online (socket: ${socket.id})`);

        try {
            const matches = await matchRepository.fetchUserMatches(userId);

            const onlineMatchIds = [];
            for (const m of matches) {
                if (await onlineUsers.has(m.user_id)) {
                    onlineMatchIds.push(m.user_id);
                }
            }

            socket.emit('online_status', { onlineUsers: onlineMatchIds });

            for (const match of matches) {
                const matchSocketId = await onlineUsers.get(match.user_id);
                if (matchSocketId) {
                    io.to(matchSocketId).emit('friend_online', { userId });
                }
            }
        } catch (err) {
            logger.error(`Error in user_online for user ${userId}: ${err.message}`);
        }
    });

    socket.on('disconnect', async () => {
        const userId = socket.userId;
        if (!userId) return;

        const currentSocketId = await onlineUsers.get(userId);
        if (currentSocketId === socket.id) {
            await onlineUsers.delete(userId);
            logger.info(`User ${userId} is offline`);

            try {
                const matches = await matchRepository.fetchUserMatches(userId);
                for (const match of matches) {
                    const matchSocketId = await onlineUsers.get(match.user_id);
                    if (matchSocketId) {
                        io.to(matchSocketId).emit('friend_offline', { userId });
                    }
                }
            } catch (err) {
                logger.error(`Error in disconnect presence for user ${userId}: ${err.message}`);
            }
        }
    });
};
