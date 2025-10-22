"""
File upload routes
"""
import os
from flask import Blueprint, request
from werkzeug.utils import secure_filename

from utils.decorators import token_required
from utils.helpers import success_response, error_response

uploads_bp = Blueprint('uploads', __name__)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@uploads_bp.route('', methods=['POST'])
@token_required
def upload_file(user_id):
    """Upload screenshot"""
    try:
        if 'file' not in request.files:
            return error_response('Bad request', 'No file provided', 400)

        file = request.files['file']

        if file.filename == '':
            return error_response('Bad request', 'No file selected', 400)

        if not allowed_file(file.filename):
            return error_response('Bad request', 'File type not allowed', 400)

        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)

        if file_size > MAX_FILE_SIZE:
            return error_response('Bad request', 'File size exceeds limit', 413)

        # Save file
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # Return file URL (adjust this based on your serving setup)
        file_url = f'/uploads/{filename}'

        return success_response({
            'filename': filename,
            'url': file_url,
            'size': file_size
        }, 'File uploaded successfully', 201)

    except Exception as e:
        return error_response('Upload failed', str(e), 500)


# For local development, you can serve uploads like this:
# from flask import send_from_directory
# @app.route('/uploads/<path:filename>')
# def download_file(filename):
#     return send_from_directory(UPLOAD_FOLDER, filename)
#
# For production, use S3 or CDN
