# 0x.ship MVP - Backend

A Flask-based backend for the 0x.ship hackathon project discovery platform. This implementation demonstrates proof-weighted discovery through community voting and expert validation.

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Project Management**: Create, edit, and publish hackathon projects
- **Community Engagement**: Upvote/downvote projects and leave comments
- **Expert Validation**: Admins can award Silver/Gold/Platinum badges
- **Proof Score System**: Dynamic scoring based on verification, community signal, expert validation, and project quality
- **Blockchain Integration**: Read-only 0xCerts verification on Kaia Testnet
- **Intro Requests**: Builder-to-investor introduction workflow
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: Redis-backed rate limiting for API endpoints

## Tech Stack

- **Framework**: Flask 3.0
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: Flask-JWT-Extended
- **Validation**: Marshmallow
- **Blockchain**: Web3.py for Kaia interaction
- **Caching**: Redis
- **File Storage**: AWS S3 (optional)

## Project Structure

```
backend/
├── app.py                    # Main Flask application
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
│
├── models/                # SQLAlchemy models
│   ├── user.py
│   ├── project.py
│   ├── vote.py
│   ├── comment.py
│   ├── badge.py
│   └── intro.py
│
├── routes/                # Blueprint route handlers
│   ├── auth.py           # Authentication endpoints
│   ├── projects.py       # Project CRUD
│   ├── votes.py          # Voting endpoints
│   ├── comments.py       # Comment endpoints
│   ├── badges.py         # Badge management
│   ├── intros.py         # Intro requests
│   ├── blockchain.py     # 0xCerts verification
│   ├── users.py          # User profiles
│   └── uploads.py        # File uploads
│
├── schemas/               # Marshmallow validation schemas
│   ├── user.py
│   ├── project.py
│   ├── vote.py
│   ├── comment.py
│   ├── badge.py
│   └── intro.py
│
├── utils/                 # Utility modules
│   ├── decorators.py      # Auth decorators
│   ├── validators.py      # Input validation
│   ├── blockchain.py      # Web3 utilities
│   ├── cache.py           # Redis caching
│   ├── scores.py          # Proof score calculation
│   └── helpers.py         # Common helpers
│
├── seeds/                 # Database seeding
│   └── demo_data.py
│
├── migrations/            # Alembic migrations
│
└── tests/                # Test files
    ├── test_auth.py
    ├── test_projects.py
    └── conftest.py
```

## Setup Instructions

### Prerequisites

- Python 3.11+
- PostgreSQL 12+
- Redis 6+
- Git

### 1. Clone and Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Configuration

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup

```bash
# Create database
createdb oxship

# Initialize migrations
flask db upgrade
```

### 4. Redis Setup

```bash
# Start Redis (local development)
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

### 5. Run Development Server

```bash
flask run
# Server runs on http://localhost:5000
```

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Projects
- `GET /api/projects` - List projects (with filtering/sorting)
- `GET /api/projects/<id>` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/<id>` - Update project
- `DELETE /api/projects/<id>` - Delete project
- `POST /api/projects/<id>/feature` - Feature project (admin)

### Voting
- `POST /api/votes` - Cast/remove vote
- `GET /api/votes/user` - Get user's votes

### Comments
- `GET /api/comments?project_id=<id>` - Get comments
- `POST /api/comments` - Create comment
- `PUT /api/comments/<id>` - Edit comment
- `DELETE /api/comments/<id>` - Delete comment

### Badges
- `POST /api/badges/award` - Award badge (admin only)
- `GET /api/badges/<project_id>` - Get project badges

### Intros
- `POST /api/intros/request` - Request intro
- `PUT /api/intros/<id>/accept` - Accept intro
- `PUT /api/intros/<id>/decline` - Decline intro
- `GET /api/intros/received` - Received requests
- `GET /api/intros/sent` - Sent requests

### Blockchain
- `POST /api/blockchain/verify-cert` - Verify 0xCert
- `GET /api/blockchain/cert-info/<address>` - Get cert info

### Users
- `GET /api/users/<username>` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user stats

### Files
- `POST /api/upload` - Upload screenshot

## Proof Score Calculation

The system calculates project scores across 4 categories:

### Category 1: Basic Verification (Max 20 points)
- Email verified: 5 points
- 0xCert owned: 10 points
- GitHub connected: 5 points

### Category 2: Community Signal (Max 30 points)
- Upvote ratio: 0-20 points
- Comment engagement: 0-10 points (0.5 per comment, max 10)

### Category 3: Expert Validation (Max 30 points)
- Silver badge: 10 points
- Gold badge: 15 points
- Platinum badge: 20 points

### Category 4: Project Quality (Max 20 points)
- Has demo link: 5 points
- Has GitHub link: 5 points
- Has screenshots: 5 points
- Complete description (>200 chars): 5 points

## Environment Variables

See `.env.example` for all available configuration options.

**Critical Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET_KEY` - JWT signing key
- `REDIS_URL` - Redis connection string
- `KAIA_TESTNET_RPC` - Kaia blockchain RPC endpoint
- `OXCERTS_CONTRACT_ADDRESS` - 0xCerts NFT contract address

## Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=routes --cov=models
```

## Database Migrations

```bash
# Create migration
flask db migrate -m "description"

# Apply migration
flask db upgrade

# Rollback
flask db downgrade
```

## Deployment

### Docker Deployment

```bash
# Build image
docker build -t oxship-backend .

# Run container
docker run -p 5000:5000 --env-file .env oxship-backend
```

### Production Checklist

- [ ] Set `FLASK_ENV=production`
- [ ] Generate strong `JWT_SECRET_KEY`
- [ ] Use PostgreSQL on managed database service
- [ ] Use managed Redis (e.g., Upstash)
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Run database migrations
- [ ] Set up automated backups

## Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL service
sudo service postgresql status
```

### Redis Connection Issues
```bash
# Test connection
redis-cli ping
# Should return: PONG
```

### JWT Token Issues
```bash
# Token expired - request new token using refresh endpoint
POST /api/auth/refresh
```

### Blockchain Connection Issues
- Verify `KAIA_TESTNET_RPC` URL is accessible
- Check contract address is valid
- Use blockchain explorer to verify contract exists

## Security Considerations

1. **Input Validation**: All inputs validated with Marshmallow
2. **SQL Injection**: Protected via SQLAlchemy ORM
3. **CORS**: Configured to allow only specified origins
4. **JWT**: Secure token-based authentication
5. **Rate Limiting**: Redis-based rate limiting
6. **Password Hashing**: bcrypt with proper salt

## Performance Optimizations

1. **Feed Caching**: Project feed cached in Redis (10 min TTL)
2. **Database Indexing**: Indexes on frequently queried columns
3. **Query Optimization**: Eager loading where necessary
4. **Response Pagination**: All list endpoints paginated

## Support & Documentation

For more details, refer to:
- Flask documentation: https://flask.palletsprojects.com/
- SQLAlchemy docs: https://docs.sqlalchemy.org/
- Marshmallow docs: https://marshmallow.readthedocs.io/
- Web3.py docs: https://web3py.readthedocs.io/

## Contributing

1. Create a feature branch
2. Make changes and test
3. Submit pull request

## License

MIT License - See LICENSE file for details
