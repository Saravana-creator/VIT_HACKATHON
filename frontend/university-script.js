// University Portal Script
let userWallet = localStorage.getItem('userWallet');

// Check authentication
if (!userWallet || localStorage.getItem('userRole') !== 'university') {
    window.location.href = 'login.html';
}

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

// Logout
function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userWallet');
    window.location.href = 'login.html';
}

// Issue Certificate
document.getElementById('issueForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        studentAddress: document.getElementById('studentAddress').value,
        studentName: document.getElementById('studentName').value,
        course: document.getElementById('course').value,
        graduationDate: document.getElementById('graduationDate').value,
        degreeHash: document.getElementById('degreeHash').value,
        universityAddress: userWallet
    };

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

// View Student Record (Read-Only)
async function viewStudentRecord() {
    const tokenId = document.getElementById('searchTokenId').value;
    
    if (!tokenId) {
        showResult('studentRecords', 'Please enter a token ID', false);
        return;
    }

    try {
        const response = await fetch(`/api/credentials/verify/${tokenId}`);
        const result = await response.json();

        if (result.success) {
            displayStudentRecord('studentRecords', result.credential, tokenId);
        } else {
            showResult('studentRecords', 'Student record not found', false);
        }
    } catch (error) {
        showResult('studentRecords', `Error: ${error.message}`, false);
    }
}

// Display student record (read-only)
function displayStudentRecord(elementId, credential, tokenId) {
    const resultElement = document.getElementById(elementId);
    
    resultElement.innerHTML = `
        <div class="certificate-card">
            <h3>Student Record (Read-Only)</h3>
            <div class="certificate-info">
                <p><strong>Token ID:</strong> <span>${tokenId}</span></p>
                <p><strong>Student Name:</strong> <span>${credential.studentName}</span></p>
                <p><strong>Course:</strong> <span>${credential.course}</span></p>
                <p><strong>Graduation Date:</strong> <span>${credential.graduationDate}</span></p>
                <p><strong>University:</strong> <span>${credential.university}</span></p>
                <p><strong>Student Wallet:</strong> <span>${credential.owner}</span></p>
                <p><strong>Degree Hash:</strong> <span style="word-break: break-all;">${credential.degreeHash}</span></p>
                <p style="color: #718096; font-style: italic; margin-top: 1rem;">
                    ⚠️ This is a read-only view. Only the student can modify their profile.
                </p>
            </div>
        </div>
    `;
    
    resultElement.className = 'result success';
    resultElement.style.display = 'block';
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
        const response = await fetch(`/api/credentials/verify/${tokenId}`);
        const result = await response.json();
        
        if (result.success) {
            let verificationMessage = '';
            
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

// Display certificate
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

// Generate sample hash
function generateSampleHash() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Validate Ethereum address
function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showResult('walletStatus', `🏛️ University Portal - Connected: ${userWallet}`, true);
    
    // Sample hash generator
    const degreeHashInput = document.getElementById('degreeHash');
    degreeHashInput.addEventListener('dblclick', () => {
        degreeHashInput.value = generateSampleHash();
    });
});