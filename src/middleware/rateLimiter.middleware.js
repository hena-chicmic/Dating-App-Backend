const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { getRedisClient } = require('../config/redis');

const makeStore = () => new RedisStore({
    sendCommand: (...args) => getRedisClient().call(...args),
});

const jsonHandler = (req, res) => {
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
    });
};

// Standard limit for login/register
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:auth:${ipKeyGenerator(req, res)}`
});

// Strict limit for password reset and resend-verification
const strictAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:strict-auth:${ipKeyGenerator(req, res)}`
});

// Swipe rate limit
const swipeLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:swipe:${ipKeyGenerator(req, res)}`
});

// Global safety net
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:global:${ipKeyGenerator(req, res)}`
});

module.exports = { authLimiter, strictAuthLimiter, swipeLimiter, globalLimiter };
