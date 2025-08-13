// Student Dashboard Script
let userWallet = localStorage.getItem('userWallet');
let userEmail = localStorage.getItem('userEmail');
let loginMethod = localStorage.getItem('loginMethod');

// Check authentication
if (localStorage.getItem('userRole') !== 'student') {
    window.location.href = 'login.html';
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
    
    // Generate QR code when QR section is shown
    if (sectionName === 'qr-code') {
        generateStudentQR();
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

// Generate Student QR Code with info
function generateStudentQRWithInfo() {
    const email = document.getElementById('studentQrEmail').value;
    const username = document.getElementById('studentQrUsername').value;
    const department = document.getElementById('studentQrDepartment').value;
    
    if (!email || !username || !department) {
        alert('Please fill in all fields');
        return;
    }
    
    const studentData = {
        type: 'student',
        wallet: userWallet || 'N/A',
        email: email,
        username: username,
        department: department,
        timestamp: new Date().toISOString(),
        loginMethod: loginMethod,
        studentId: generateStudentId()
    };
    
    // Show info popup first
    showStudentInfoPopup(studentData);
    
    // Generate QR code
    generateStudentQRCode(studentData);
}

// Generate Student QR Code
function generateStudentQRCode(data) {
    const qrContainer = document.getElementById('studentQR');
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
        
        document.getElementById('studentDownloadBtn').style.display = 'block';
        console.log('Student QR Code generated successfully with URL:', qrURL);
    } catch (error) {
        console.error('QR Code generation error:', error);
        qrContainer.innerHTML = '<p style="color: red;">Error generating QR code</p>';
    }
}

// Show student info popup
function showStudentInfoPopup(data) {
    const popup = document.createElement('div');
    popup.innerHTML = `
        <div class="popup-overlay" onclick="closeStudentPopup()"></div>
        <div class="info-popup">
            <div class="popup-header">
                <h3>🎓 Student Information</h3>
                <button class="close-btn" onclick="closeStudentPopup()">×</button>
            </div>
            <div class="popup-content">
                <p><strong>📧 Email:</strong> ${data.email}</p>
                <p><strong>👤 Username:</strong> ${data.username}</p>
                <p><strong>🏢 Department:</strong> ${data.department}</p>
                <p><strong>🆔 Student ID:</strong> ${data.studentId}</p>
                <p><strong>💳 Wallet:</strong> ${data.wallet}</p>
                <p><strong>🕒 Generated:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            </div>
            <button onclick="closeStudentPopup()" class="btn-primary" style="width: 100%; margin-top: 1rem;">Close</button>
        </div>
    `;
    
    popup.id = 'studentInfoPopup';
    document.body.appendChild(popup);
}

// Close student popup
function closeStudentPopup() {
    const popup = document.getElementById('studentInfoPopup');
    if (popup) {
        popup.remove();
    }
}

// Generate unique student ID
function generateStudentId() {
    const saved = localStorage.getItem('studentId');
    if (saved) return saved;
    
    const id = 'STU' + Date.now().toString().slice(-6);
    localStorage.setItem('studentId', id);
    return id;
}

// Download QR Code
function downloadQR() {
    const img = document.querySelector('#studentQR img');
    if (img) {
        const link = document.createElement('a');
        link.download = 'student-qr-code.png';
        link.href = img.src;
        link.click();
    } else {
        alert('Please generate QR code first');
    }
}

// Legacy function for compatibility
function generateStudentQR() {
    // Auto-fill with saved profile data if available
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('studentQrEmail').value = profile.email || '';
        document.getElementById('studentQrUsername').value = profile.name || '';
    }
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
            if (userWallet && result.credential.owner.toLowerCase() === userWallet.toLowerCase()) {
                showResult('certificateResult', `✅ This is your certificate!`, true);
            } else if (!userWallet) {
                showResult('certificateResult', `📜 Certificate found`, true);
            } else {
                showResult('certificateResult', `⚠️ This certificate belongs to ${result.credential.owner}`, false);
                return;
            }
            displayCertificate('certificateResult', result.credential, tokenId);
            updateCertificateCount();
        } else {
            showResult('certificateResult', 'Certificate not found', false);
        }
    } catch (error) {
        showResult('certificateResult', `Error: ${error.message}`, false);
    }
}

// Update Profile
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const profileData = {
        name: document.getElementById('profileName').value,
        studentId: document.getElementById('profileStudentId').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        department: document.getElementById('profileDepartment').value,
        year: document.getElementById('profileYear').value,
        address: document.getElementById('profileAddress').value,
        bio: document.getElementById('profileBio').value,
        walletAddress: userWallet || 'demo-student',
        timestamp: new Date().toISOString()
    };

    try {
        showResult('profileResult', 'Updating profile...', true);
        localStorage.setItem('userProfile', JSON.stringify(profileData));
        showResult('profileResult', 'Profile updated successfully!', true);
        updateProfileStatus();
        updateStudentProfileDisplay();
    } catch (error) {
        showResult('profileResult', `Error: ${error.message}`, false);
    }
});

// Update Settings
document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const settingsData = {
        language: document.getElementById('settingsLanguage').value,
        timezone: document.getElementById('settingsTimezone').value,
        enableNotifications: document.getElementById('enableStudentNotifications').checked,
        enableTwoFactor: document.getElementById('enableStudentTwoFactor').checked,
        autoBackup: document.getElementById('studentAutoBackup').checked,
        publicProfile: document.getElementById('studentPublicProfile').checked,
        autoDownloadCerts: document.getElementById('autoDownloadCerts').checked,
        shareWithEmployers: document.getElementById('shareWithEmployers').checked,
        defaultCertFormat: document.getElementById('defaultCertFormat').value,
        timestamp: new Date().toISOString()
    };

    try {
        showResult('settingsResult', 'Updating settings...', true);
        localStorage.setItem('studentSettings', JSON.stringify(settingsData));
        showResult('settingsResult', 'Settings updated successfully!', true);
    } catch (error) {
        showResult('settingsResult', `Error: ${error.message}`, false);
    }
});

// Export Student Settings
function exportStudentSettings() {
    const settings = localStorage.getItem('studentSettings');
    if (!settings) {
        alert('No settings to export');
        return;
    }
    
    const blob = new Blob([settings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Reset Student Settings
function resetStudentSettings() {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
        localStorage.removeItem('studentSettings');
        document.getElementById('settingsForm').reset();
        showResult('settingsResult', 'Settings reset to default', true);
    }
}

// Update Student Profile Display
function updateStudentProfileDisplay() {
    document.getElementById('studentProfileWallet').textContent = userWallet ? 
        `${userWallet.substring(0, 6)}...${userWallet.substring(38)}` : 'Not connected';
    document.getElementById('studentProfileLoginMethod').textContent = loginMethod || 'Credentials';
    document.getElementById('studentProfileCertCount').textContent = localStorage.getItem('studentCertificates') || '0';
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

// Update certificate count
function updateCertificateCount() {
    const count = localStorage.getItem('studentCertificates') || 0;
    const newCount = parseInt(count) + 1;
    localStorage.setItem('studentCertificates', newCount);
    document.getElementById('certificateCount').textContent = `${newCount} certificate${newCount !== 1 ? 's' : ''}`;
}

// Update profile status
function updateProfileStatus() {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
        document.getElementById('profileStatus').textContent = 'Profile completed ✅';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set user info
    if (userWallet) {
        document.getElementById('studentWallet').textContent = `Wallet: ${userWallet.substring(0, 6)}...${userWallet.substring(38)}`;
    } else if (userEmail) {
        document.getElementById('studentWallet').textContent = `Email: ${userEmail}`;
    }
    
    // Load saved profile
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        document.getElementById('studentName').textContent = profile.name || 'Student';
        document.getElementById('profileName').value = profile.name || '';
        document.getElementById('profileStudentId').value = profile.studentId || '';
        document.getElementById('profileEmail').value = profile.email || '';
        document.getElementById('profilePhone').value = profile.phone || '';
        document.getElementById('profileDepartment').value = profile.department || '';
        document.getElementById('profileYear').value = profile.year || '';
        document.getElementById('profileAddress').value = profile.address || '';
        document.getElementById('profileBio').value = profile.bio || '';
        updateProfileStatus();
    }
    
    // Load saved settings
    const savedSettings = localStorage.getItem('studentSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('settingsLanguage').value = settings.language || 'en';
        document.getElementById('settingsTimezone').value = settings.timezone || 'UTC';
        document.getElementById('enableStudentNotifications').checked = settings.enableNotifications || false;
        document.getElementById('enableStudentTwoFactor').checked = settings.enableTwoFactor || false;
        document.getElementById('studentAutoBackup').checked = settings.autoBackup || false;
        document.getElementById('studentPublicProfile').checked = settings.publicProfile || false;
        document.getElementById('autoDownloadCerts').checked = settings.autoDownloadCerts || false;
        document.getElementById('shareWithEmployers').checked = settings.shareWithEmployers || false;
        document.getElementById('defaultCertFormat').value = settings.defaultCertFormat || 'pdf';
    }
    
    // Load avatar
    const savedAvatar = localStorage.getItem('studentAvatar');
    if (savedAvatar) {
        const avatar = document.getElementById('studentProfileAvatar');
        avatar.style.backgroundImage = `url(${savedAvatar})`;
        avatar.style.backgroundSize = 'cover';
        avatar.style.backgroundPosition = 'center';
        avatar.textContent = '';
    }
    
    // Update profile display
    updateStudentProfileDisplay();
    
    // Load certificate count
    const certCount = localStorage.getItem('studentCertificates') || 0;
    document.getElementById('certificateCount').textContent = `${certCount} certificate${certCount !== 1 ? 's' : ''}`;
    
    // Avatar upload handler
    document.getElementById('studentAvatarUpload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatar = document.getElementById('studentProfileAvatar');
                avatar.style.backgroundImage = `url(${e.target.result})`;
                avatar.style.backgroundSize = 'cover';
                avatar.style.backgroundPosition = 'center';
                avatar.textContent = '';
                
                localStorage.setItem('studentAvatar', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
});