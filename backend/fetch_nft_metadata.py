"""
Script to fetch NFT metadata for users who already have verified 0xCerts
"""
import sys
import io

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app import create_app
from extensions import db
from models.user import User
from utils.blockchain import BlockchainService

def fetch_metadata_for_verified_users():
    """Fetch NFT metadata for all verified users"""
    app = create_app()

    with app.app_context():
        try:
            print("Fetching NFT metadata for verified users...")

            # Get all users with 0xCert but no metadata
            users = User.query.filter(
                User.has_oxcert == True,
                User.wallet_address.isnot(None)
            ).all()

            print(f"Found {len(users)} users with verified 0xCerts")

            for user in users:
                print(f"\nProcessing user: {user.username} ({user.wallet_address})")

                # Check ownership and fetch metadata
                result = BlockchainService.check_oxcert_ownership(user.wallet_address)

                if result['error']:
                    print(f"  Error: {result['error']}")
                    continue

                if result['has_cert']:
                    print(f"  ✓ 0xCert confirmed (Balance: {result['balance']})")

                    # Update NFT details if available
                    if result.get('nft_details'):
                        nft_details = result['nft_details']
                        user.oxcert_token_id = str(result.get('token_id'))
                        user.oxcert_metadata = nft_details.get('metadata')
                        user.oxcert_tx_hash = nft_details.get('tx_hash')

                        print(f"  ✓ Token ID: {user.oxcert_token_id}")
                        if nft_details.get('metadata'):
                            print(f"  ✓ Metadata: {nft_details['metadata'].get('name', 'No name')}")
                        else:
                            print(f"  ⚠ No metadata available")
                    else:
                        print(f"  ⚠ No NFT details available")
                else:
                    print(f"  ✗ No 0xCert found")
                    user.has_oxcert = False

            db.session.commit()
            print("\n✅ Metadata fetch completed successfully!")

        except Exception as e:
            print(f"\n❌ Fetch failed: {str(e)}")
            import traceback
            traceback.print_exc()
            db.session.rollback()
            raise


if __name__ == '__main__':
    fetch_metadata_for_verified_users()
