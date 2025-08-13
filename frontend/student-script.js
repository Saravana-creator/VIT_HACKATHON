// Student Portal Script
let userWallet = localStorage.getItem('userWallet');

// Check authentication
if (!userWallet || localStorage.getItem('userRole') !== 'student') {
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

// View My Certificate
async function viewMyCertificate() {
    const tokenId = document.getElementById('tokenId').value;
    
    if (!tokenId) {
        showResult('certificateResult', 'Please enter a token ID', false);
        return;
    }

    try {
        const response = await fetch(`/api/credentials/verify/${tokenId}`);
        const result = await response.json();

        if (result.success) {
            // Check if user owns this certificate
            if (result.credential.owner.toLowerCase() === userWallet.toLowerCase()) {
                showResult('certificateResult', `✅ This is your certificate!`, true);
            } else {
                showResult('certificateResult', `⚠️ This certificate belongs to ${result.credential.owner}`, false);
                return;
            }
            displayCertificate('certificateResult', result.credential, tokenId);
        } else {
            showResult('certificateResult', 'Certificate not found', false);
        }
    } catch (error) {
        showResult('certificateResult', `Error: ${error.message}`, false);
    }
}

// Update Profile (Decentralized)
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        address: document.getElementById('profileAddress').value,
        bio: document.getElementById('profileBio').value,
        walletAddress: userWallet,
        timestamp: new Date().toISOString()
    };

    try {
        showResult('profileResult', 'Updating profile on blockchain...', true);
        
        const response = await fetch('/api/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (result.success) {
            showResult('profileResult', 
                `Profile updated successfully! Transaction: ${result.transactionHash}`, 
                true
            );
            // Store locally as backup
            localStorage.setItem('userProfile', JSON.stringify(profileData));
        } else {
            showResult('profileResult', `Error: ${result.error}`, false);
        }
    } catch (error) {
        // Fallback to local storage if blockchain fails
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        showResult('profileResult', 
            'Profile saved locally (blockchain unavailable). Your data is stored securely on your device.', 
            true
        );
    }
});

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    showResult('walletStatus', `🎓 Student Portal - Connected: ${userWallet}`, true);
    
    // Load saved profile
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileAddress').value = profile.address || '';
        document.getElementById('profileBio').value = profile.bio || '';
    }
});