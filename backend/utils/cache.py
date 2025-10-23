"""
Caching utilities using Redis
"""
import json
import redis
from flask import current_app


class CacheService:
    """Redis caching service"""

    @staticmethod
    def get_redis_client():
        """Get Redis client instance"""
        try:
            redis_url = current_app.config.get('REDIS_URL', 'redis://localhost:6379/0')
            # Handle both redis:// and rediss:// (TLS) connections
            # Upstash uses rediss:// for TLS
            return redis.from_url(
                redis_url,
                decode_responses=True,
                ssl_cert_reqs=None  # For Upstash TLS compatibility
            )
        except Exception as e:
            print(f"Redis connection failed: {e}")
            return None

    @staticmethod
    def set(key: str, value, ttl: int = 3600):
        """Set cache value with TTL (default 1 hour)"""
        try:
            client = CacheService.get_redis_client()
            if client:
                # Serialize if not string
                if not isinstance(value, str):
                    value = json.dumps(value)
                client.setex(key, ttl, value)
                return True
        except Exception as e:
            print(f"Cache set error: {e}")
        return False

    @staticmethod
    def get(key: str):
        """Get cache value"""
        try:
            client = CacheService.get_redis_client()
            if client:
                value = client.get(key)
                if value:
                    # Try to deserialize
                    try:
                        return json.loads(value)
                    except:
                        return value
        except Exception as e:
            print(f"Cache get error: {e}")
        return None

    @staticmethod
    def delete(key: str):
        """Delete cache key"""
        try:
            client = CacheService.get_redis_client()
            if client:
                client.delete(key)
                return True
        except Exception as e:
            print(f"Cache delete error: {e}")
        return False

    @staticmethod
    def clear_pattern(pattern: str):
        """Delete all keys matching pattern"""
        try:
            client = CacheService.get_redis_client()
            if client:
                keys = client.keys(pattern)
                if keys:
                    client.delete(*keys)
                return True
        except Exception as e:
            print(f"Cache clear error: {e}")
        return False

    @staticmethod
    def cache_feed(page: int, sort: str, data: list, ttl: int = 600):
        """Cache project feed (10 minutes)"""
        key = f"feed:{sort}:page:{page}"
        return CacheService.set(key, data, ttl)

    @staticmethod
    def get_cached_feed(page: int, sort: str):
        """Get cached project feed"""
        key = f"feed:{sort}:page:{page}"
        return CacheService.get(key)

    @staticmethod
    def invalidate_project_feed():
        """Invalidate all feed caches when project changes"""
        CacheService.clear_pattern("feed:*")

    @staticmethod
    def cache_project(project_id: str, data: dict, ttl: int = 3600):
        """Cache project details (1 hour)"""
        key = f"project:{project_id}"
        return CacheService.set(key, data, ttl)

    @staticmethod
    def get_cached_project(project_id: str):
        """Get cached project"""
        key = f"project:{project_id}"
        return CacheService.get(key)

    @staticmethod
    def invalidate_project(project_id: str):
        """Invalidate project cache and related feeds"""
        CacheService.delete(f"project:{project_id}")
        CacheService.invalidate_project_feed()

    @staticmethod
    def cache_user(user_id: str, data: dict, ttl: int = 3600):
        """Cache user profile (1 hour)"""
        key = f"user:{user_id}"
        return CacheService.set(key, data, ttl)

    @staticmethod
    def get_cached_user(user_id: str):
        """Get cached user"""
        key = f"user:{user_id}"
        return CacheService.get(key)

    @staticmethod
    def invalidate_user(user_id: str):
        """Invalidate user cache"""
        CacheService.delete(f"user:{user_id}")
