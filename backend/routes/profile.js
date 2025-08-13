const express = require('express');
const router = express.Router();

// In-memory storage for profiles (in production, use IPFS or decentralized storage)
let profiles = {};

// Update student profile
router.post('/update', async (req, res) => {
  try {
    const { name, email, phone, address, bio, walletAddress, timestamp } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Store profile data (in production, this would be stored on IPFS or similar)
    profiles[walletAddress.toLowerCase()] = {
      name,
      email,
      phone,
      address,
      bio,
      walletAddress,
      timestamp,
      updatedAt: new Date().toISOString()
    };

    // Simulate blockchain transaction
    const mockTransactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      transactionHash: mockTransactionHash
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student profile
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const profile = profiles[walletAddress.toLowerCase()];

    if (profile) {
      res.json({
        success: true,
        profile
      });
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;