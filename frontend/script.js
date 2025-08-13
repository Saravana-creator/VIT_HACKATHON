// Check wallet connection
let userWallet = null;

// Navigation
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
}

// Utility functions
function showResult(elementId, message, isSuccess = true) {
    const resultElement = document.getElementById(elementId);
    resultElement.textContent = message;
    resultElement.className = `result ${isSuccess ? 'success' : 'error'}`;
    resultElement.style.display = 'block';
}

// Check MetaMask connection
async function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                userWallet = accounts[0];
                updateWalletUI();
                return true;
            }
        } catch (error) {
            console.error('Error checking wallet:', error);
        }
    }
    return false;
}

// Connect wallet
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                userWallet = accounts[0];
                updateWalletUI();
                showResult('walletStatus', `✅ Connected: ${userWallet}`, true);
                return true;
            } else {
                showResult('walletStatus', '❌ No accounts found', false);
                return false;
            }
        } catch (error) {
            if (error.code === 4001) {
                showResult('walletStatus', '❌ User rejected connection', false);
            } else {
                showResult('walletStatus', `❌ Connection failed: ${error.message}`, false);
            }
            return false;
        }
    } else {
        showResult('walletStatus', '❌ MetaMask not installed. Please install MetaMask extension.', false);
        return false;
    }
}

// Update wallet UI
function updateWalletUI() {
    if (userWallet) {
        const walletBtn = document.getElementById('walletBtn');
        walletBtn.textContent = `Connected: ${userWallet.substring(0, 6)}...${userWallet.substring(38)}`;
        walletBtn.style.backgroundColor = '#48bb78';
    }
}

// Issue Certificate with MetaMask
document.getElementById('issueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check wallet connection first
    const isConnected = await checkWalletConnection();
    if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
            showResult('issueResult', 'Please connect your wallet to issue certificates', false);
            return;
        }
    }

    const formData = {
        studentAddress: document.getElementById('studentAddress').value,
        studentName: document.getElementById('studentName').value,
        course: document.getElementById('course').value,
        graduationDate: document.getElementById('graduationDate').value,
        degreeHash: document.getElementById('degreeHash').value,
        universityAddress: userWallet // Add connected wallet address
    };

    // Validate Ethereum address
    if (!isValidEthereumAddress(formData.studentAddress)) {
        showResult('issueResult', 'Invalid Ethereum address format', false);
        return;
    }

    try {
        showResult('issueResult', 'Checking university authorization...', true);
        
        const response = await fetch('/api/credentials/mint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showResult('issueResult', 
                `Certificate issued successfully! Token ID: ${result.tokenId}. Transaction: ${result.transactionHash}`, 
                true
            );
            document.getElementById('issueForm').reset();
        } else {
            showResult('issueResult', `Error: ${result.error}`, false);
        }
    } catch (error) {
        showResult('issueResult', `Network error: ${error.message}`, false);
    }
});

// View Certificate with wallet check
async function viewCertificate() {
    const tokenId = document.getElementById('tokenId').value;
    
    if (!tokenId) {
        showResult('studentResult', 'Please enter a token ID', false);
        return;
    }

    // Check wallet connection
    const isConnected = await checkWalletConnection();
    if (!isConnected) {
        const connected = await connectWallet();
        if (!connected) {
            showResult('studentResult', 'Please connect your wallet to view certificates', false);
            return;
        }
    }

    try {
        const response = await fetch(`/api/credentials/verify/${tokenId}`);
        const result = await response.json();

        if (result.success) {
            // Check if user owns this certificate
            if (result.credential.owner.toLowerCase() === userWallet.toLowerCase()) {
                showResult('studentResult', `✅ You own this certificate!`, true);
            } else {
                showResult('studentResult', `⚠️ This certificate belongs to ${result.credential.owner}`, false);
            }
            displayCertificate('studentResult', result.credential, tokenId);
        } else {
            showResult('studentResult', 'Certificate not found', false);
        }
    } catch (error) {
        showResult('studentResult', `Error: ${error.message}`, false);
    }
}

// Verify Certificate
async function verifyCertificate() {
    const tokenId = document.getElementById('verifyTokenId').value;
    const degreeHash = document.getElementById('verifyHash').value;

    if (!tokenId) {
        showResult('verifyResult', 'Please enter a token ID', false);
        return;
    }

    try {
        // Get certificate details
        const response = await fetch(`/api/credentials/verify/${tokenId}`);
        const result = await response.json();

        if (result.success) {
            let verificationMessage = '';
            
            // If hash provided, verify it
            if (degreeHash) {
                const hashResponse = await fetch('/api/credentials/verify-hash', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tokenId, degreeHash })
                });
                
                const hashResult = await hashResponse.json();
                verificationMessage = hashResult.isValid ? 
                    'Certificate is VALID and hash matches!' : 
                    'Certificate exists but hash does NOT match!';
            }

            displayCertificate('verifyResult', result.credential, tokenId, verificationMessage);
        } else {
            showResult('verifyResult', 'Certificate not found or invalid', false);
        }
    } catch (error) {
        showResult('verifyResult', `Error: ${error.message}`, false);
    }
}

// Display certificate information
function displayCertificate(elementId, credential, tokenId, verificationMessage = '') {
    const resultElement = document.getElementById(elementId);
    
    resultElement.innerHTML = `
        <div class="certificate-card">
            <h3>Certificate Details</h3>
            <div class="certificate-info">
                <p><strong>Token ID:</strong> <span>${tokenId}</span></p>
                <p><strong>Student Name:</strong> <span>${credential.studentName}</span></p>
                <p><strong>Course:</strong> <span>${credential.course}</span></p>
                <p><strong>Graduation Date:</strong> <span>${credential.graduationDate}</span></p>
                <p><strong>University:</strong> <span>${credential.university}</span></p>
                <p><strong>Owner:</strong> <span>${credential.owner}</span></p>
                <p><strong>Degree Hash:</strong> <span style="word-break: break-all;">${credential.degreeHash}</span></p>
                ${verificationMessage ? `<p style="color: ${verificationMessage.includes('VALID') ? '#22543d' : '#742a2a'}; font-weight: bold; margin-top: 1rem;">${verificationMessage}</p>` : ''}
            </div>
        </div>
    `;
    
    resultElement.className = 'result success';
    resultElement.style.display = 'block';
}

// Validate Ethereum address
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Generate sample hash for testing
function generateSampleHash() {
    const sampleText = document.getElementById('studentName').value + document.getElementById('course').value + Date.now();
    return btoa(sampleText).substring(0, 32);
}

// Initialize wallet connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        showResult('walletStatus', '⚠️ MetaMask not detected. Please install MetaMask extension.', false);
    } else {
        // Check if wallet is already connected
        const isConnected = await checkWalletConnection();
        if (isConnected) {
            showResult('walletStatus', `✅ Wallet connected: ${userWallet}`, true);
        } else {
            showResult('walletStatus', '🔗 Click "Connect Wallet" to connect MetaMask', true);
        }
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                userWallet = accounts[0];
                updateWalletUI();
                showResult('walletStatus', `✅ Account changed: ${userWallet}`, true);
            } else {
                userWallet = null;
                document.getElementById('walletBtn').textContent = 'Connect Wallet';
                document.getElementById('walletBtn').style.backgroundColor = '#4299e1';
                showResult('walletStatus', '❌ Wallet disconnected', false);
            }
        });
        
        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId) => {
            console.log('Chain changed to:', chainId);
            window.location.reload();
        });
    }
    
    // Sample hash generator
    const degreeHashInput = document.getElementById('degreeHash');
    degreeHashInput.addEventListener('focus', () => {
        if (!degreeHashInput.value) {
            degreeHashInput.placeholder = 'Click to generate sample hash or enter your own';
        }
    });
    
    degreeHashInput.addEventListener('dblclick', () => {
        degreeHashInput.value = generateSampleHash();
    });
});