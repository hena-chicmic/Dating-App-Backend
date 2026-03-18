const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middleware/error.middleware');
const { globalLimiter } = require('./middleware/rateLimiter.middleware');

const authRoutes = require('./routes/auth.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const matchRoutes = require('./routes/match.routes');
const interactionRoutes = require('./routes/interaction.routes');
const messageRoutes = require('./routes/message.routes');

const notificationRoutes = require('./routes/notification.routes');
const reportRoutes = require('./routes/report.routes');

const userRoutes = require('./routes/user.routes');


const app = express();

app.use(cors({
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:8000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global rate limiter to all API routes
app.use('/api/v1', globalLimiter);




// Swagger Documentation Page
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount Routes

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/matches', matchRoutes);
app.use('/api/v1/interactions', interactionRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.use('/api/v1/reports', reportRoutes);

app.use('/api/v1/users', userRoutes);
//app.use('/api/v1/notifications', notificationRoutes);
// centralized error handler
app.use(errorHandler);


module.exports = app;
