"""
Blockchain utilities for 0xCerts verification
"""
from web3 import Web3
from flask import current_app
import json


class BlockchainService:
    """Service for blockchain interactions"""

    # 0xCerts ABI (Minimal ERC721 interface)
    ERC721_ABI = json.loads('''
    [
        {
            "constant": true,
            "inputs": [{"name": "_owner", "type": "address"}],
            "name": "balanceOf",
            "outputs": [{"name": "balance", "type": "uint256"}],
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [{"name": "_tokenId", "type": "uint256"}],
            "name": "ownerOf",
            "outputs": [{"name": "owner", "type": "address"}],
            "type": "function"
        }
    ]
    ''')

    @staticmethod
    def get_web3_instance():
        """Get Web3 instance"""
        rpc_url = current_app.config['KAIA_TESTNET_RPC']
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        return w3

    @staticmethod
    def is_valid_address(address: str) -> bool:
        """Validate Ethereum address"""
        if not address or not address.startswith('0x'):
            return False
        return Web3.is_address(address)

    @staticmethod
    def normalize_address(address: str) -> str:
        """Normalize address to checksum format"""
        return Web3.to_checksum_address(address)

    @staticmethod
    def check_oxcert_ownership(wallet_address: str) -> dict:
        """
        Check if address owns 0xCert NFT
        Returns: {
            'has_cert': bool,
            'balance': int,
            'error': str or None
        }
        """
        try:
            if not BlockchainService.is_valid_address(wallet_address):
                return {
                    'has_cert': False,
                    'balance': 0,
                    'error': 'Invalid wallet address'
                }

            w3 = BlockchainService.get_web3_instance()
            contract_address = current_app.config['OXCERTS_CONTRACT_ADDRESS']

            if not BlockchainService.is_valid_address(contract_address):
                return {
                    'has_cert': False,
                    'balance': 0,
                    'error': 'Invalid contract address configured'
                }

            # Create contract instance
            contract = w3.eth.contract(
                address=BlockchainService.normalize_address(contract_address),
                abi=BlockchainService.ERC721_ABI
            )

            # Check balance
            normalized_address = BlockchainService.normalize_address(wallet_address)
            balance = contract.functions.balanceOf(normalized_address).call()

            return {
                'has_cert': balance > 0,
                'balance': balance,
                'error': None
            }

        except Exception as e:
            return {
                'has_cert': False,
                'balance': 0,
                'error': f'Blockchain check failed: {str(e)}'
            }

    @staticmethod
    def get_network_status() -> dict:
        """Get blockchain network status"""
        try:
            w3 = BlockchainService.get_web3_instance()
            is_connected = w3.is_connected()
            block_number = w3.eth.block_number if is_connected else None

            return {
                'connected': is_connected,
                'block_number': block_number,
                'network': 'Kaia Testnet (Kairos)',
            }
        except Exception as e:
            return {
                'connected': False,
                'block_number': None,
                'error': str(e)
            }
