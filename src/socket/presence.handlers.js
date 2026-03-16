const onlineUsers = require('./online-users');
const matchRepository = require('../repositories/match.repository');

module.exports = (socket, io) => {

    socket.on('user_online', async (userId) => {
        userId = parseInt(userId);
        onlineUsers.set(userId, socket.id);
        socket.userId = userId; 
        console.log(`User ${userId} is online (socket: ${socket.id})`);

        try {
            const matches = await matchRepository.fetchUserMatches(userId);
            const onlineMatchIds = matches
                .map(m => m.user_id)
                .filter(id => onlineUsers.has(id));

            socket.emit('online_status', { onlineUsers: onlineMatchIds });
            matches.forEach(match => {
                const matchSocketId = onlineUsers.get(match.user_id);
                if (matchSocketId) {
                    io.to(matchSocketId).emit('friend_online', { userId });
                }
            });
        } catch (err) {
            console.error('Error in user_online:', err.message);
        }
    });

    
    socket.on('disconnect', async () => {
        const userId = socket.userId;
        if (!userId) return;

        onlineUsers.delete(userId);
        console.log(`User ${userId} is offline`);

        try {
            const matches = await matchRepository.fetchUserMatches(userId);
            matches.forEach(match => {
                const matchSocketId = onlineUsers.get(match.user_id);
                if (matchSocketId) {
                    io.to(matchSocketId).emit('friend_offline', { userId });
                }
            });
        } catch (err) {
            console.error('Error in disconnect presence:', err.message);
        }
    });
};
