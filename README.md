# NFT-Based Academic Credential Verification System

A complete blockchain-based system for issuing and verifying academic credentials as NFTs to prevent certificate forgery.

## Features

- **University Portal**: Issue degree certificates as NFTs
- **Student Portal**: View owned certificates
- **Public Verification**: Verify certificate authenticity
- **Blockchain Security**: Ethereum-based smart contracts
- **Hash Verification**: Document integrity checking

## Project Structure

```
├── frontend/           # HTML, CSS, JavaScript frontend
├── backend/           # Node.js Express API
├── contracts/         # Solidity smart contracts
├── scripts/          # Deployment scripts
└── package.json      # Dependencies
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

1. Copy `.env.example` to `.env`
2. Get Infura/Alchemy RPC URL for Sepolia testnet
3. Add your private key (with Sepolia ETH)
4. Update the `.env` file:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=deployed_contract_address_here
PORT=3000
```

### 3. Compile Smart Contract

```bash
npm run compile
```

### 4. Deploy to Sepolia Testnet

```bash
npm run deploy
```

Copy the deployed contract address to your `.env` file.

### 5. Start the Server

```bash
npm start
```

Visit `http://localhost:3000`

## Usage Guide

### For Universities

1. Go to **University** tab
2. Fill in student details:
   - Student wallet address
   - Student name
   - Course/degree
   - Graduation date
   - Degree hash (double-click to generate sample)
3. Click "Issue Certificate"
4. Note the Token ID for the student

### For Students

1. Go to **Student** tab
2. Enter your Token ID
3. Click "View Certificate"
4. See your certificate details

### For Verification

1. Go to **Verify** tab
2. Enter Token ID
3. Optionally enter degree hash for authenticity check
4. Click "Verify Certificate"

## Testing

### Local Testing

1. Start the server: `npm start`
2. Open `http://localhost:3000`
3. Use the University tab to issue a test certificate
4. Use a test Ethereum address like: `0x742d35Cc6634C0532925a3b8D0C9C0E3C5d5c8eA`
5. Verify the certificate using the Verify tab

### Testnet Testing

1. Ensure you have Sepolia ETH in your wallet
2. Deploy the contract to Sepolia
3. Update CONTRACT_ADDRESS in `.env`
4. Issue certificates using real wallet addresses
5. Students can view certificates using MetaMask

## Smart Contract Functions

- `mintCredential()`: Issue new certificate NFT
- `getCredential()`: Retrieve certificate details
- `verifyCredential()`: Verify degree hash
- `authorizeUniversity()`: Add authorized university

## API Endpoints

- `POST /api/credentials/mint`: Issue new certificate
- `GET /api/credentials/verify/:tokenId`: Get certificate details
- `POST /api/credentials/verify-hash`: Verify degree hash

## Security Features

- Only authorized universities can mint certificates
- Private keys stored in environment variables
- Hash verification for document integrity
- Blockchain immutability prevents tampering

## Troubleshooting

### Common Issues

1. **"Contract not deployed"**: Run `npm run deploy` first
2. **"Insufficient funds"**: Add Sepolia ETH to your wallet
3. **"Invalid address"**: Use proper Ethereum address format (0x...)
4. **"Network error"**: Check your RPC URL and internet connection

### Getting Testnet ETH

1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address
3. Request test ETH

## Development

### Adding New Features

1. Update smart contract in `contracts/CredentialNFT.sol`
2. Recompile and redeploy
3. Update API routes in `backend/routes/credentials.js`
4. Update frontend in `frontend/` directory

### Testing Smart Contract

```bash
npx hardhat test
```

## Production Deployment

1. Use mainnet RPC URL
2. Secure private key management
3. Set up proper domain and SSL
4. Configure production environment variables
5. Use process manager like PM2

## License

MIT License - See LICENSE file for details