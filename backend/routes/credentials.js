const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

const contractABI = [
  "function mintCredential(address student, string studentName, string course, string graduationDate, string degreeHash) returns (uint256)",
  "function getCredential(uint256 tokenId) view returns (tuple(string studentName, string course, string graduationDate, string degreeHash, address university))",
  "function verifyCredential(uint256 tokenId, string degreeHash) view returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function authorizedUniversities(address) view returns (bool)",
  "function authorizeUniversity(address university)",
  "event CredentialMinted(uint256 indexed tokenId, address indexed student, address indexed university, string studentName, string course)"
];

// Alternative: Get token ID from return value
const getTokenIdFromTransaction = async (tx) => {
  try {
    const receipt = await tx.wait();
    
    // Method 1: Parse events
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog.name === 'CredentialMinted') {
          return parsedLog.args[0].toString();
        }
      } catch (error) {
        continue;
      }
    }
    
    // Method 2: Use transaction return value (if available)
    return null;
  } catch (error) {
    console.error('Error getting token ID:', error);
    return null;
  }
};

let provider, contract, wallet;

try {
  provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
} catch (error) {
  console.error('Blockchain connection error:', error.message);
}

router.post('/mint', async (req, res) => {
  try {
    const { studentAddress, studentName, course, graduationDate, degreeHash, universityAddress } = req.body;

    if (!studentAddress || !studentName || !course || !graduationDate || !degreeHash || !universityAddress) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if the connected wallet is authorized as a university
    try {
      const isAuthorized = await contract.authorizedUniversities(universityAddress);
      if (!isAuthorized) {
        // Auto-authorize if not already authorized
        try {
          const authTx = await contract.authorizeUniversity(universityAddress);
          await authTx.wait();
          console.log(`Auto-authorized university: ${universityAddress}`);
        } catch (autoAuthError) {
          return res.status(403).json({ 
            error: `Address ${universityAddress} is not authorized to issue certificates. Please login as university first to get authorized.` 
          });
        }
      }
    } catch (authError) {
      return res.status(500).json({ 
        error: 'Failed to check university authorization. Make sure the contract is properly deployed.' 
      });
    }

    const tx = await contract.mintCredential(
      studentAddress,
      studentName,
      course,
      graduationDate,
      degreeHash
    );

    const receipt = await tx.wait();
    const tokenId = await getTokenIdFromTransaction(tx);

    res.json({
      success: true,
      tokenId,
      transactionHash: receipt.hash
    });
  } catch (error) {
    console.error('Minting error:', error);
    if (error.message.includes('Not authorized university')) {
      res.status(403).json({ error: 'Only authorized universities can issue certificates' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

router.get('/verify/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const credential = await contract.getCredential(tokenId);
    const owner = await contract.ownerOf(tokenId);

    res.json({
      success: true,
      credential: {
        studentName: credential[0],
        course: credential[1],
        graduationDate: credential[2],
        degreeHash: credential[3],
        university: credential[4],
        owner
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Credential not found or invalid' });
  }
});

router.post('/verify-hash', async (req, res) => {
  try {
    const { tokenId, degreeHash } = req.body;
    const isValid = await contract.verifyCredential(tokenId, degreeHash);
    
    res.json({
      success: true,
      isValid
    });
  } catch (error) {
    console.error('Hash verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Authorize university (auto-authorize during login)
router.post('/authorize-university', async (req, res) => {
  try {
    const { universityAddress } = req.body;
    
    if (!universityAddress) {
      return res.status(400).json({ error: 'University address is required' });
    }

    // Check if already authorized
    try {
      const isAlreadyAuthorized = await contract.authorizedUniversities(universityAddress);
      if (isAlreadyAuthorized) {
        return res.json({
          success: true,
          message: `University ${universityAddress} is already authorized`
        });
      }
    } catch (checkError) {
      console.log('Could not check authorization status, proceeding with authorization');
    }

    // Authorize the university
    const tx = await contract.authorizeUniversity(universityAddress);
    await tx.wait();
    
    res.json({
      success: true,
      message: `University ${universityAddress} has been authorized`,
      transactionHash: tx.hash
    });
  } catch (error) {
    console.error('Authorization error:', error);
    if (error.message.includes('already authorized') || error.message.includes('Ownable')) {
      // If already authorized or ownership issue, still allow login
      res.json({
        success: true,
        message: 'University access granted'
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;