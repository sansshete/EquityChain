import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/equitychain',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // Blockchain
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL || '',
  polygonRpcUrl: process.env.POLYGON_RPC_URL || '',
  sepoliaRpcUrl: process.env.SEPOLIA_RPC_URL || '',
  privateKey: process.env.PRIVATE_KEY || '',
  
  // Contract Addresses
  factoryContractMainnet: process.env.FACTORY_CONTRACT_MAINNET || '',
  factoryContractPolygon: process.env.FACTORY_CONTRACT_POLYGON || '',
  factoryContractSepolia: process.env.FACTORY_CONTRACT_SEPOLIA || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT || '587'),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Platform Settings
  platformFeePercentage: 250, // 2.5%
  minProjectFunding: 10000, // $10,000 minimum
  maxProjectFunding: 10000000, // $10M maximum
  defaultFundingDuration: 30, // 30 days
};

export const getNetworkConfig = (chainId: number) => {
  switch (chainId) {
    case 1: // Ethereum Mainnet
      return {
        rpcUrl: config.ethereumRpcUrl,
        factoryAddress: config.factoryContractMainnet,
        name: 'Ethereum Mainnet'
      };
    case 137: // Polygon Mainnet
      return {
        rpcUrl: config.polygonRpcUrl,
        factoryAddress: config.factoryContractPolygon,
        name: 'Polygon Mainnet'
      };
    case 11155111: // Sepolia Testnet
      return {
        rpcUrl: config.sepoliaRpcUrl,
        factoryAddress: config.factoryContractSepolia,
        name: 'Sepolia Testnet'
      };
    default:
      throw new Error(`Unsupported network: ${chainId}`);
  }
};