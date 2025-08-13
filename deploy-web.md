# Web Deployment Guide

## Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Set Environment Variables in Vercel Dashboard:**
- `SEPOLIA_RPC_URL`: Your Alchemy URL
- `PRIVATE_KEY`: Your private key
- `CONTRACT_ADDRESS`: Deployed contract address

## Option 2: Netlify

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Deploy:**
```bash
netlify deploy --prod
```

## Option 3: Railway

1. **Go to** [railway.app](https://railway.app)
2. **Connect GitHub** and select your repo
3. **Add environment variables**
4. **Deploy automatically**

## Option 4: Render

1. **Go to** [render.com](https://render.com)
2. **Create Web Service** from GitHub
3. **Set build command:** `npm install`
4. **Set start command:** `npm start`
5. **Add environment variables**

## Quick Deploy Steps:

1. **First deploy the smart contract:**
```bash
npm run deploy
```

2. **Copy contract address to .env**

3. **Choose a platform and deploy**

4. **Your app will be live at the provided URL**

## Environment Variables Needed:
- `SEPOLIA_RPC_URL`
- `PRIVATE_KEY` 
- `CONTRACT_ADDRESS`
- `PORT` (optional, platforms set automatically)