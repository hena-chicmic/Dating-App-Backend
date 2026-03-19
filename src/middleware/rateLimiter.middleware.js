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

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:auth:${ipKeyGenerator(req, res)}`
});

const strictAuthLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:strict-auth:${ipKeyGenerator(req, res)}`
});

const swipeLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:swipe:${ipKeyGenerator(req, res)}`
});

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: jsonHandler,
    store: makeStore(),
    keyGenerator: (req, res) => `rate:global:${ipKeyGenerator(req, res)}`
});

module.exports = { authLimiter, strictAuthLimiter, swipeLimiter, globalLimiter };
