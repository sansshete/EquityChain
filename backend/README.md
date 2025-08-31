# EquityChain Backend API

## Overview

The EquityChain backend provides a comprehensive REST API for the blockchain crowdfunding platform. It handles user authentication, project management, investment tracking, and blockchain integration.

## Features

- **User Management**: Registration, authentication, and KYC verification
- **Project Management**: Creation, approval workflow, and tracking
- **Investment Processing**: Investment recording and verification
- **Blockchain Integration**: Smart contract interaction and event monitoring
- **Admin Dashboard**: Platform administration and moderation
- **Security**: JWT authentication, rate limiting, and input validation

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb equitychain

# Run migrations
npm run migrate
```

### 4. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/wallet` - Wallet-based authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Projects
- `GET /api/projects` - Get approved projects
- `POST /api/projects` - Create new project (requires auth + KYC)
- `GET /api/projects/:id` - Get project by ID
- `GET /api/projects/contract/:contractAddress` - Get project by contract address
- `GET /api/projects/creator/my-projects` - Get creator's projects
- `GET /api/projects/categories` - Get project categories

### Investments
- `POST /api/investments` - Record new investment
- `GET /api/investments/my-investments` - Get user's investments
- `GET /api/investments/project/:projectId` - Get project investments
- `GET /api/investments/stats` - Get investment statistics
- `GET /api/investments/portfolio` - Get portfolio summary

### Blockchain
- `GET /api/blockchain/networks/:chainId/projects` - Get projects from blockchain
- `GET /api/blockchain/projects/:contractAddress` - Get project details from blockchain
- `GET /api/blockchain/transactions/:transactionHash/verify` - Verify transaction
- `GET /api/blockchain/networks` - Get supported networks

### Admin (Admin only)
- `GET /api/admin/projects/pending` - Get pending projects
- `PUT /api/admin/projects/:projectId/approve` - Approve project
- `PUT /api/admin/projects/:projectId/reject` - Reject project
- `GET /api/admin/users` - Get all users
- `GET /api/admin/kyc/pending` - Get pending KYC verifications
- `GET /api/admin/stats` - Get platform statistics

## Database Schema

### Users
- User registration and profile management
- KYC verification status
- Role-based access control

### Projects
- Project information and metadata
- Approval workflow tracking
- Blockchain synchronization

### Investments
- Investment records and tracking
- Transaction verification
- Portfolio management

### KYC Documents
- Document upload and verification
- Review workflow

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: Security headers
- **Error Handling**: Secure error responses

## Blockchain Integration

- **Multi-Network Support**: Ethereum, Polygon, Sepolia
- **Smart Contract Interaction**: Direct contract calls
- **Transaction Verification**: On-chain verification
- **Event Monitoring**: Real-time blockchain events
- **Gas Optimization**: Efficient contract interactions

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

## Deployment

The backend can be deployed to any Node.js hosting platform:

1. **Heroku**: Use the included `Procfile`
2. **AWS**: Deploy to EC2 or Lambda
3. **DigitalOcean**: App Platform deployment
4. **Railway**: Direct Git deployment

## Monitoring

- **Winston Logging**: Comprehensive logging system
- **Health Checks**: `/health` endpoint for monitoring
- **Error Tracking**: Detailed error logging and reporting
- **Performance Metrics**: Request timing and database query monitoring