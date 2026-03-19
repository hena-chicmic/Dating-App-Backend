const presenceHandlers = require('./presence.handlers');
const chatHandlers = require('./chat.handlers');
const callHandlers = require('./call.handlers');

module.exports = (socket, io) => {

    presenceHandlers(socket, io);

    chatHandlers(socket, io);

    callHandlers(socket, io);
};
