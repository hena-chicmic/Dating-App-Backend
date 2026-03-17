const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => console.error("Redis Error", err));

(async () => {
  await client.connect();
})();

function rateLimiter({ windowSeconds = 60, maxRequests = 10 } = {}) {
  return async (req, res, next) => {
    try {
      const key = `rate:${req.ip}`;

      let current = await client.incr(key);

      if (current === 1) {
        await client.expire(key, windowSeconds);
      }

      const remaining = Math.max(0, maxRequests - current);

      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", remaining);

      if (current > maxRequests) {
        return res.status(429).json({
          message: "Too many requests"
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = rateLimiter;