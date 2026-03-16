const presenceHandlers = require('./presence.handlers');
const chatHandlers = require('./chat.handlers');
const callHandlers = require('./call.handlers');

module.exports = (socket, io) => {
    // 1. Presence — tracks online/offline status (sets socket.userId)
    presenceHandlers(socket, io);

    // 2. Chat — join rooms, send/receive messages, read receipts, typing
    chatHandlers(socket, io);

    // 3. Calls — WebRTC signaling (offer, answer, ICE, end, reject)
    callHandlers(socket, io);
};
