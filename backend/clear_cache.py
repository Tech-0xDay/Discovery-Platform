"""
Clear Redis cache - Run this after backend code changes
"""
import redis
import os
from dotenv import load_dotenv

load_dotenv()

def clear_all_cache():
    """Clear all Redis cache"""
    try:
        redis_url = os.getenv('REDIS_URL', 'redis://localhost:6379/0')
        client = redis.from_url(redis_url, decode_responses=True, ssl_cert_reqs=None)

        # Get all keys
        keys = client.keys('*')

        if keys:
            print(f"Found {len(keys)} cache keys")
            client.delete(*keys)
            print(f"[SUCCESS] Cleared {len(keys)} cache keys")
        else:
            print("No cache keys found")

    except Exception as e:
        print(f"[ERROR] Error clearing cache: {e}")

if __name__ == "__main__":
    clear_all_cache()
