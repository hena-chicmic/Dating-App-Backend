const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const matchRoutes = require('./routes/match.routes');
const interactionRoutes = require('./routes/interaction.routes');
<<<<<<< HEAD
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');

=======
const userRoutes = require('./routes/user.routes');
//const notificationRoutes = require('./routes/notification.routes');
>>>>>>> 7cf74c9 (swagger and media upload done)
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Documentation Page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/interactions', interactionRoutes);
<<<<<<< HEAD
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);

=======
app.use('/api/v1/users', userRoutes);
//app.use('/api/v1/notifications', notificationRoutes);
>>>>>>> 7cf74c9 (swagger and media upload done)
// centralized error handler
app.use(errorHandler);

module.exports = app;
