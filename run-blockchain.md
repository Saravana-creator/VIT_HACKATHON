# Run with Blockchain

## Step 1: Get Sepolia ETH
Your wallet: `0x4D12FC860305A671DC28D4F76CBA437473d3981a`

Visit any faucet:
- https://sepoliafaucet.com/
- https://faucets.chain.link/sepolia
- https://faucet.quicknode.com/ethereum/sepolia

## Step 2: Deploy Contract
```bash
npm run deploy
```

## Step 3: Update Contract Address
Copy the deployed address to `.env` file

## Step 4: Start Server
```bash
npm start
```

## Step 5: Test the System
1. Go to http://localhost:3000
2. Use University tab to issue certificates
3. Use Student tab to view certificates
4. Use Verify tab to verify authenticity

## Current Status:
- ✅ Smart contract ready
- ✅ Backend API ready  
- ✅ Frontend ready
- ❌ Need Sepolia ETH for deployment

## Quick Test (Without Deployment):
```bash
npm run demo
```
This runs a demo version without blockchain.