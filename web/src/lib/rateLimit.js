/**
 * In-Memory Sliding Window IP Rate Limiter
 * Tracks request timestamps per client IP within a rolling time window.
 */

const rateLimitMap = new Map();

// Periodic cleanup every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.resetTime > 60000) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check if a client IP is allowed under the rate limit.
 * @param {string} ip - Client IP identifier
 * @param {object} options - { limit: number, windowMs: number }
 * @returns {{ allowed: boolean, remaining: number, resetSeconds: number }}
 */
export function checkRateLimit(ip, { limit = 15, windowMs = 60000 } = {}) {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    // Local dev: generous limit
    limit = Math.max(limit, 60);
  }

  const now = Date.now();
  const record = rateLimitMap.get(ip) || { timestamps: [], resetTime: now + windowMs };

  // Filter timestamps within current rolling window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  record.timestamps.push(now);
  record.resetTime = now + windowMs;
  rateLimitMap.set(ip, record);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

/**
 * Extract client IP from incoming Next.js Request headers
 * @param {Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}
