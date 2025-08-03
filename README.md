# EquityChain - Blockchain Crowdfunding Equity Distribution Platform

## Overview

EquityChain is a revolutionary blockchain-based crowdfunding platform that democratizes equity investment through smart contracts and tokenized ownership. Built on Ethereum and Polygon networks, it enables startups to raise capital while providing investors with transparent, secure, and liquid equity tokens.

### Key Features

- **Tokenized Equity**: ERC-20 compliant equity tokens representing real ownership stakes
- **Smart Contract Automation**: Automated fund distribution, milestone tracking, and refund mechanisms
- **Global Accessibility**: Permissionless investment participation from anywhere in the world
- **AI-Powered Assistance**: Intelligent chatbot to guide users through the platform
- **Multi-Network Support**: Ethereum, Polygon, and testnets for cost-effective transactions
- **Transparent Governance**: Public blockchain ensures complete transparency and immutability

## Architecture

### Blockchain Type: Public Blockchain
- **Network**: Ethereum Mainnet, Polygon, Sepolia Testnet
- **Permission Model**: Hybrid (Permissioned project approval, Permissionless participation)
- **Token Standard**: ERC-20 for equity tokens
- **Security**: Multi-signature wallets, ReentrancyGuard, and audited smart contracts

### Smart Contract Architecture

```
ProjectFactory.sol (Main Factory)
├── Creates and manages EquityToken contracts
├── Handles project approval workflow
├── Manages platform fees and governance
└── Tracks all projects and creators

EquityToken.sol (Individual Projects)
├── ERC-20 compliant equity tokens
├── Investment and refund mechanisms
├── Milestone tracking system
├── Automated fund distribution
└── Investor management
```

##  Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Blockchain
- **Solidity ^0.8.19** for smart contracts
- **Hardhat** for development and testing
- **OpenZeppelin** for security standards
- **ethers.js** for Web3 integration

### Development Tools
- **MetaMask** integration for wallet connectivity
- **ESLint** for code quality
- **TypeScript** for type safety

## Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Git** for version control

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/equitychain.git
cd equitychain
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Blockchain Network URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGON_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here

# Optional: For production deployment
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 4. Compile Smart Contracts
```bash
npm run compile-contracts
```

### 5. Deploy Contracts (Local Development)
```bash
# Start local Hardhat node (in separate terminal)
npx hardhat node

# Deploy contracts to local network
npm run deploy-local
```

### 6. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Usage Guide

### For Investors

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Approve MetaMask connection
   - Ensure you have ETH/MATIC for gas fees

2. **Browse Projects**
   - Explore featured projects on the homepage
   - Filter by category, funding status, or equity offered
   - Click on projects to view detailed information

3. **Make Investments**
   - Enter investment amount (must meet minimum requirement)
   - Review equity percentage and estimated returns
   - Confirm transaction in MetaMask
   - Receive equity tokens automatically

4. **Track Portfolio**
   - Visit "Portfolio" dashboard
   - Monitor investment performance
   - View transaction history and equity tokens

### For Project Creators

1. **Create Project**
   - Click "Create Project" in the header
   - Fill out project details (3-step process)
   - Set funding goals and equity parameters
   - Submit for platform approval

2. **Project Management**
   - Monitor funding progress in Creator Dashboard
   - Add milestones and updates
   - Communicate with investors
   - Withdraw funds after successful funding

3. **Post-Funding**
   - Manage investor relations
   - Provide regular updates
   - Handle dividend distributions (if applicable)

## Smart Contract Details

### ProjectFactory Contract

**Key Functions:**
- `createProject()`: Deploy new equity token contracts
- `approveProject()`: Admin approval for project listing
- `getApprovedProjects()`: Fetch all approved projects
- `calculatePlatformFee()`: Calculate platform fees

**Security Features:**
- Owner-only functions for critical operations
- Project approval workflow
- Fee management system

### EquityToken Contract

**Key Functions:**
- `invest()`: Accept investments and mint equity tokens
- `withdrawFunds()`: Creator fund withdrawal after success
- `refund()`: Investor refunds if funding fails
- `addMilestone()`: Track project progress

**Security Features:**
- ReentrancyGuard protection
- Investment limits and validation
- Automated refund mechanisms
- Milestone-based fund release

## Security Measures

### Smart Contract Security
- **Audited Contracts**: OpenZeppelin standards
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Access Control**: Role-based permissions
- **Input Validation**: Comprehensive parameter checking

### Platform Security
- **KYC Integration**: Identity verification for creators
- **Project Vetting**: Manual approval process
- **Multi-signature**: Enhanced security for critical functions
- **Rate Limiting**: Protection against spam and abuse

### User Security
- **Non-custodial**: Users maintain control of their funds
- **MetaMask Integration**: Secure wallet connectivity
- **Transaction Transparency**: All operations on public blockchain
- **Emergency Procedures**: Refund mechanisms for failed projects

## Network Configuration

### Supported Networks

| Network | Chain ID | Currency | Purpose |
|---------|----------|----------|---------|
| Ethereum Mainnet | 1 | ETH | Production |
| Polygon Mainnet | 137 | MATIC | Low-cost production |
| Sepolia Testnet | 11155111 | SepoliaETH | Testing |
| Localhost | 31337 | ETH | Development |

### Gas Optimization
- **Polygon Integration**: Significantly lower transaction costs
- **Batch Operations**: Minimize transaction count
- **Efficient Contracts**: Optimized Solidity code
- **Gas Estimation**: Real-time fee calculation

## AI Assistant Features

The integrated AI assistant helps users with:

- **Investment Guidance**: Step-by-step investment process
- **Project Creation**: How to launch funding campaigns
- **Blockchain Education**: Understanding equity tokens and smart contracts
- **Security Information**: Platform safety and protection measures
- **Wallet Connectivity**: MetaMask setup and troubleshooting
- **Platform Navigation**: Finding features and understanding dashboards
- **Legal Compliance**: KYC requirements and regulatory information

## Platform Economics

### Fee Structure
- **Platform Fee**: 2.5% of successfully raised funds
- **No Listing Fees**: Free project submission
- **No Monthly Fees**: Pay only on success

### Investment Parameters
- **Minimum Investment**: Set by individual projects (typically $1,000-$5,000)
- **Maximum Investment**: No platform limits
- **Equity Range**: 1-100% (typically 5-20% for crowdfunding)

## Testing

### Run Tests
```bash
# Smart contract tests
npx hardhat test

# Frontend tests (if implemented)
npm test

# Coverage report
npx hardhat coverage
```

### Test Networks
Use Sepolia testnet for testing:
1. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
2. Deploy contracts to Sepolia
3. Test all functionality without real money

## Deployment

### Frontend Deployment (Netlify)
```bash
# Build for production
npm run build

# Deploy to Netlify (automated via Git)
# Or manual deployment:
netlify deploy --prod --dir=dist
```

### Smart Contract Deployment
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Deploy to Polygon mainnet
npx hardhat run scripts/deploy.js --network polygon
```

### Environment Variables for Production
```env
VITE_CONTRACT_ADDRESS_MAINNET=0x...
VITE_CONTRACT_ADDRESS_POLYGON=0x...
VITE_INFURA_PROJECT_ID=your_infura_id
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open Pull Request**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

