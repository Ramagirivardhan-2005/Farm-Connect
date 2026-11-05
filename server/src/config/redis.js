import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class MemoryRedisFallback {
  constructor() {
    this.store = new Map();
    this.ttl = new Map();
  }

  async get(key) {
    if (this.ttl.has(key) && Date.now() > this.ttl.get(key)) {
      this.store.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.store.get(key) || null;
  }

  async set(key, value, ex, seconds) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (ex === 'EX' && seconds) {
      this.ttl.set(key, Date.now() + seconds * 1000);
    }
    return 'OK';
  }

  async del(key) {
    this.store.delete(key);
    this.ttl.delete(key);
    return 1;
  }

  async incr(key) {
    const val = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, val.toString());
    return val;
  }

  async expire(key, seconds) {
    this.ttl.set(key, Date.now() + seconds * 1000);
    return 1;
  }
}

let redisClient;
let isRedisConnected = false;

try {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't loop retry indefinitely if not running
    connectTimeout: 2000,
  });

  client.on('connect', () => {
    isRedisConnected = true;
    console.log('Redis connected successfully at:', REDIS_URL);
  });

  client.on('error', (err) => {
    if (!isRedisConnected) {
      // Quietly switch to in-memory fallback
      redisClient = new MemoryRedisFallback();
    }
  });

  redisClient = client;
} catch (e) {
  redisClient = new MemoryRedisFallback();
}

export function getRedisClient() {
  if (!redisClient) {
    redisClient = new MemoryRedisFallback();
  }
  return redisClient;
}

export default getRedisClient;
