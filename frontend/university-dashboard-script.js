// University Dashboard Script
let userWallet = localStorage.getItem('userWallet');
let userEmail = localStorage.getItem('userEmail');
let loginMethod = localStorage.getItem('loginMethod');

// Check authentication
if (localStorage.getItem('userRole') !== 'university') {
    window.location.href = 'login.html';
}

// If no wallet address (credential login), use the deployer address from contract deployment
if (!userWallet || !userWallet.startsWith('0x')) {
    userWallet = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'; // Default test address
    localStorage.setItem('userWallet', userWallet);
}

// Navigation
function showSection(sectionName) {
    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[onclick="showSection('${sectionName}')"]`).classList.add('active');
    
    // Show/hide sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionName).style.display = 'block';
    
    // Auto-fill form when QR section is shown
    if (sectionName === 'qr-code') {
        // Auto-fill with saved data if available
        const savedSettings = localStorage.getItem('universitySettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            document.getElementById('qrEmail').value = settings.email || userEmail || '';
            document.getElementById('qrUsername').value = settings.name || 'University Admin';
            document.getElementById('qrDepartment').value = 'Administration';
        }
    }
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
    localStorage.clear();
    window.location.href = 'login.html';
}

// Generate QR Code with user info
function generateQRWithInfo() {
    const email = document.getElementById('qrEmail').value;
    const username = document.getElementById('qrUsername').value;
    const department = document.getElementById('qrDepartment').value;
    
    if (!email || !username || !department) {
        alert('Please fill in all fields');
        return;
    }
    
    const universityData = {
        type: 'university',
        wallet: userWallet || 'N/A',
        email: email,
        username: username,
        department: department,
        timestamp: new Date().toISOString(),
        loginMethod: loginMethod
    };
    
    // Show info popup first
    showInfoPopup(universityData);
    
    // Generate QR code
    generateQRCode(universityData);
}

// Generate QR Code
function generateQRCode(data) {
    const qrContainer = document.getElementById('universityQR');
    qrContainer.innerHTML = '';
    
    // Create URL with encoded data for Google Lens compatibility
    const encodedData = btoa(JSON.stringify(data));
    const qrURL = `${window.location.origin}/user-info.html?data=${encodedData}`;
    
    try {
        const qr = qrcode(0, 'M');
        qr.addData(qrURL);
        qr.make();
        
        const qrHTML = qr.createImgTag(4, 8);
        qrContainer.innerHTML = qrHTML + `<p style="margin-top: 1rem; font-size: 0.9rem; color: #718096;">Scannable with Google Lens, Camera apps, and QR scanners</p>`;
        
        document.getElementById('downloadBtn').style.display = 'block';
        console.log('QR Code generated successfully with URL:', qrURL);
    } catch (error) {
        console.error('QR Code generation error:', error);
        qrContainer.innerHTML = '<p style="color: red;">Error generating QR code</p>';
    }
}

// Show info popup
function showInfoPopup(data) {
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div class="popup-overlay" onclick="closePopup()"></div>
        <div class="info-popup">
            <div class="popup-header">
                <h3>🏛️ University Information</h3>
                <button class="close-btn" onclick="closePopup()">×</button>
            </div>
            <div class="popup-content">
                <p><strong>📧 Email:</strong> ${data.email}</p>
                <p><strong>👤 Username:</strong> ${data.username}</p>
                <p><strong>🏢 Department:</strong> ${data.department}</p>
                <p><strong>💳 Wallet:</strong> ${data.wallet}</p>
                <p><strong>🕒 Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            </div>
            <button onclick="closePopup()" class="btn-primary" style="width: 100%; margin-top: 1rem;">Close</button>
        </div>
    `;
    
    popup.id = 'infoPopup';
    document.body.appendChild(popup);
}

// Close popup
function closePopup() {
    const popup = document.getElementById('infoPopup');
    if (popup) {
        popup.remove();
    }
}

// Download QR Code
function downloadQR() {
    const img = document.querySelector('#universityQR img');
    if (img) {
        const link = document.createElement('a');
        link.download = 'university-qr-code.png';
        link.href = img.src;
        link.click();
    } else {
        alert('Please generate QR code first');
    }
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
        universityAddress: userWallet || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
    };

    if (userWallet && !isValidEthereumAddress(formData.studentAddress)) {
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
            updateStats();
        } else {
            showResult('issueResult', `Error: ${result.error}`, false);
        }
    } catch (error) {
        showResult('issueResult', `Network error: ${error.message}`, false);
    }
});

// View Student Record
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

// Display student record
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

// Update Settings
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settingsData = {
        name: document.getElementById('universityNameInput').value,
        email: document.getElementById('universityEmail').value,
        address: document.getElementById('universityAddress').value,
        wallet: userWallet,
        timestamp: new Date().toISOString()
    };

    try {
        showResult('settingsResult', 'Updating university settings...', true);
        
        // Store settings locally
        localStorage.setItem('universitySettings', JSON.stringify(settingsData));
        
        showResult('settingsResult', 'Settings updated successfully!', true);
        
        // Update display
        document.getElementById('universityName').textContent = settingsData.name || 'University Admin';
    } catch (error) {
        showResult('settingsResult', `Error: ${error.message}`, false);
    }
});

// Update statistics
function updateStats() {
    const totalCerts = localStorage.getItem('totalCertificates') || 0;
    document.getElementById('totalCertificates').textContent = parseInt(totalCerts) + 1;
    localStorage.setItem('totalCertificates', parseInt(totalCerts) + 1);
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
    // Set user info
    if (userWallet) {
        document.getElementById('universityWallet').textContent = `Wallet: ${userWallet.substring(0, 6)}...${userWallet.substring(38)}`;
    } else if (userEmail) {
        document.getElementById('universityWallet').textContent = `Email: ${userEmail}`;
    }
    
    // Load saved settings
    const savedSettings = localStorage.getItem('universitySettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('universityName').textContent = settings.name || 'University Admin';
        document.getElementById('universityNameInput').value = settings.name || '';
        document.getElementById('universityEmail').value = settings.email || '';
        document.getElementById('universityAddress').value = settings.address || '';
    }
    
    // Load stats
    const totalCerts = localStorage.getItem('totalCertificates') || 0;
    document.getElementById('totalCertificates').textContent = totalCerts;
    
    // Sample hash generator
    const degreeHashInput = document.getElementById('degreeHash');
    degreeHashInput.addEventListener('dblclick', () => {
        degreeHashInput.value = generateSampleHash();
    });
});