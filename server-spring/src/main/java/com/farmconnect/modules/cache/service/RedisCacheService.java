package com.farmconnect.modules.cache.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

@Service
public class RedisCacheService {

    private static final Logger log = LoggerFactory.getLogger(RedisCacheService.class);

    @Value("${farmconnect.redis.enabled:false}")
    private boolean redisEnabled;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisCacheService(RedisTemplate<String, Object> redisTemplate, ObjectMapper objectMapper) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public boolean isRedisEnabled() {
        return redisEnabled;
    }

    public <T> Optional<T> get(String key, Class<T> clazz) {
        if (!redisEnabled) return Optional.empty();
        try {
            Object raw = redisTemplate.opsForValue().get(key);
            if (raw == null) return Optional.empty();
            if (clazz.isInstance(raw)) {
                return Optional.of(clazz.cast(raw));
            }
            return Optional.of(objectMapper.convertValue(raw, clazz));
        } catch (Exception e) {
            log.debug("Redis GET failure for key [{}]: {}. Gracefully falling back to DB.", key, e.getMessage());
            return Optional.empty();
        }
    }

    public void set(String key, Object value, long timeoutMinutes) {
        if (!redisEnabled) return;
        try {
            redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(timeoutMinutes));
        } catch (Exception e) {
            log.debug("Redis SET failure for key [{}]: {}", key, e.getMessage());
        }
    }

    public void delete(String key) {
        if (!redisEnabled) return;
        try {
            redisTemplate.delete(key);
        } catch (Exception e) {
            log.debug("Redis DELETE failure for key [{}]: {}", key, e.getMessage());
        }
    }

    /**
     * Rate limiter: returns true if permitted, false if rate limit exceeded
     */
    public boolean checkRateLimit(String key, int maxAllowed, long windowSeconds) {
        if (!redisEnabled) return true; // Fail open if Redis is disabled
        try {
            Long count = redisTemplate.opsForValue().increment(key, 1);
            if (count != null && count == 1) {
                redisTemplate.expire(key, windowSeconds, TimeUnit.SECONDS);
            }
            return count != null && count <= maxAllowed;
        } catch (Exception e) {
            log.debug("Redis RateLimit check failed: {}. Permitting request.", e.getMessage());
            return true;
        }
    }

    // Recommendation Cache Helpers (TTL = 15 mins)
    public void cacheUserRecommendations(Long userId, Object products) {
        set("user:" + userId + ":recommended-products", products, 15);
    }

    public void cacheUserChannels(Long userId, Object channels) {
        set("user:" + userId + ":recommended-channels", channels, 15);
    }

    public void cachePopularProducts(Object products) {
        set("popular:products", products, 60);
    }

    public void cachePopularChannels(Object channels) {
        set("popular:channels", channels, 60);
    }

    public void invalidateProductCache(Long productId) {
        delete("product:" + productId);
        delete("popular:products");
    }

    public void invalidateChannelCache(Long channelId) {
        delete("channel:" + channelId + ":summary");
        delete("popular:channels");
    }
}
