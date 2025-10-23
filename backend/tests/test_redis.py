"""
Quick test script to verify Redis/Upstash connection
"""
import redis
from dotenv import load_dotenv
import os

load_dotenv()

def test_redis_connection():
    """Test Redis connection"""
    redis_url = os.getenv('REDIS_URL')

    print(f"Testing Redis connection...")
    print(f"URL: {redis_url[:30]}..." if redis_url else "No URL found")

    try:
        # Connect to Redis
        client = redis.from_url(
            redis_url,
            decode_responses=True,
            ssl_cert_reqs=None  # For Upstash TLS
        )

        # Test basic operations
        print("\n1. Testing SET operation...")
        client.set('test_key', 'Hello from 0x.ship!', ex=60)
        print("   [OK] SET successful")

        print("\n2. Testing GET operation...")
        value = client.get('test_key')
        print(f"   [OK] GET successful: {value}")

        print("\n3. Testing DELETE operation...")
        client.delete('test_key')
        print("   [OK] DELETE successful")

        print("\n4. Testing connection info...")
        info = client.info('server')
        print(f"   [OK] Redis version: {info.get('redis_version', 'Unknown')}")

        print("\n[SUCCESS] All Redis tests passed!")
        print("Your Upstash Redis is properly configured and working.\n")

        return True

    except Exception as e:
        print(f"\n[FAILED] Redis connection failed!")
        print(f"Error: {str(e)}\n")
        return False

if __name__ == '__main__':
    test_redis_connection()
