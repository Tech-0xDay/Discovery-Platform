"""
Blockchain routes for 0xCerts verification
"""
from flask import Blueprint, request
from marshmallow import Schema, fields, ValidationError

from app import db
from models.user import User
from utils.decorators import token_required, optional_auth
from utils.blockchain import BlockchainService
from utils.validators import validate_ethereum_address
from utils.helpers import success_response, error_response
from utils.scores import ProofScoreCalculator
from utils.cache import CacheService

blockchain_bp = Blueprint('blockchain', __name__)


class VerifyCertSchema(Schema):
    """Schema for cert verification"""
    wallet_address = fields.Str(required=True)


@blockchain_bp.route('/verify-cert', methods=['POST'])
@token_required
def verify_cert(user_id):
    """Verify user's 0xCert NFT"""
    try:
        data = request.get_json()
        schema = VerifyCertSchema()
        validated_data = schema.load(data)

        wallet_address = validated_data['wallet_address']

        # Validate address format
        if not validate_ethereum_address(wallet_address):
            return error_response('Invalid address', 'Invalid Ethereum address format', 400)

        # Check 0xCert ownership
        result = BlockchainService.check_oxcert_ownership(wallet_address)

        if result['error']:
            return error_response('Verification failed', result['error'], 500)

        # Update user
        user = User.query.get(user_id)
        if not user:
            return error_response('Not found', 'User not found', 404)

        user.wallet_address = wallet_address
        user.has_oxcert = result['has_cert']

        # Get all projects to update scores
        if result['has_cert']:
            for project in user.projects:
                ProofScoreCalculator.update_project_scores(project)
                CacheService.invalidate_project(project.id)

        db.session.commit()
        CacheService.invalidate_user(user_id)

        return success_response({
            'wallet_address': wallet_address,
            'has_cert': result['has_cert'],
            'balance': result['balance'],
            'user': user.to_dict()
        }, 'Cert verified successfully', 200)

    except ValidationError as e:
        return error_response('Validation error', str(e.messages), 400)
    except Exception as e:
        db.session.rollback()
        return error_response('Error', str(e), 500)


@blockchain_bp.route('/cert-info/<wallet_address>', methods=['GET'])
@optional_auth
def get_cert_info(user_id, wallet_address):
    """Get cert info for wallet address"""
    try:
        if not validate_ethereum_address(wallet_address):
            return error_response('Invalid address', 'Invalid Ethereum address format', 400)

        result = BlockchainService.check_oxcert_ownership(wallet_address)

        if result['error']:
            return error_response('Check failed', result['error'], 500)

        return success_response({
            'wallet_address': wallet_address,
            'has_cert': result['has_cert'],
            'balance': result['balance']
        }, 'Cert info retrieved', 200)

    except Exception as e:
        return error_response('Error', str(e), 500)


@blockchain_bp.route('/health', methods=['GET'])
def blockchain_health():
    """Check blockchain network health"""
    try:
        status = BlockchainService.get_network_status()

        return success_response(status, 'Network status retrieved', 200)
    except Exception as e:
        return error_response('Error', str(e), 500)
