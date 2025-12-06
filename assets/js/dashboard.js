/**
 * OutreachAI Dashboard
 * Main dashboard functionality and state management
 */

// Initialize Firestore
let db;
let currentUser = null;
let unsubscribeUserData = null;

// Dashboard state
let dashboardData = {
    tokens: 0,
    package: null,
    activeCampaigns: 0,
    totalLeads: 0,
    emailsSent: 0,
    responseRate: 0
};

/**
 * Initialize dashboard
 */
async function initDashboard() {
    // Check authentication
    firebaseAuth.onAuthStateChanged(async (user) => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            return;
        }

        currentUser = user;

        // Initialize Firestore
        db = firebase.firestore();

        // Update UI with user info
        updateUserInfo(user);

        // Load user data
        await loadUserData(user.uid);

        // Setup realtime listeners
        setupRealtimeListeners(user.uid);

        // Initialize event listeners
        initEventListeners();
    });
}

/**
 * Update user info in UI
 */
function updateUserInfo(user) {
    // Update username
    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = user.displayName || user.email.split('@')[0];
    }

    // Create user menu in navbar
    const userMenuContainer = document.getElementById('userMenuContainer');
    if (userMenuContainer) {
        userMenuContainer.innerHTML = `
            <button class="btn btn-secondary" id="logoutBtn" style="height: 38px; padding: 0.625rem 1.25rem;">
                <i data-lucide="log-out"></i>
                Logout
            </button>
        `;
        lucide.createIcons();

        // Add logout handler
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }
}

/**
 * Load user data from Firestore
 */
async function loadUserData(userId) {
    try {
        const userDoc = await db.collection('users').doc(userId).get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            dashboardData = {
                tokens: userData.tokens || 0,
                package: userData.package || null,
                activeCampaigns: userData.activeCampaigns || 0,
                totalLeads: userData.totalLeads || 0,
                emailsSent: userData.emailsSent || 0,
                responseRate: userData.responseRate || 0
            };

            // Load settings into form fields
            if (userData.displayName) {
                document.getElementById('displayName').value = userData.displayName;
            }
            document.getElementById('userEmail').value = userData.email;

            if (userData.emailSettings) {
                document.getElementById('senderName').value = userData.emailSettings.senderName || '';
                document.getElementById('senderEmail').value = userData.emailSettings.senderEmail || '';
            }

        } else {
            // Create new user document
            await db.collection('users').doc(userId).set({
                email: currentUser.email,
                displayName: currentUser.displayName,
                tokens: 0,
                package: null,
                activeCampaigns: 0,
                totalLeads: 0,
                emailsSent: 0,
                responseRate: 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Update UI
        updateDashboardUI();
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Failed to load user data', 'error');
    }
}

/**
 * Setup realtime listeners for user data
 */
function setupRealtimeListeners(userId) {
    // Listen to user document changes
    unsubscribeUserData = db.collection('users').doc(userId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const userData = doc.data();
                dashboardData = {
                    tokens: userData.tokens || 0,
                    package: userData.package || null,
                    activeCampaigns: userData.activeCampaigns || 0,
                    totalLeads: userData.totalLeads || 0,
                    emailsSent: userData.emailsSent || 0,
                    responseRate: userData.responseRate || 0
                };
                updateDashboardUI();
            }
        });
}

/**
 * Update dashboard UI with current data
 */
function updateDashboardUI() {
    // Update token balance (sidebar)
    const tokenBalance = document.getElementById('tokenBalance');
    if (tokenBalance) {
        tokenBalance.querySelector('.token-count').textContent = dashboardData.tokens.toLocaleString();
    }

    // Update current package (sidebar)
    const currentPackage = document.getElementById('currentPackage');
    if (currentPackage) {
        const packageName = dashboardData.package ? dashboardData.package.name : 'No active package';
        currentPackage.querySelector('.package-name').textContent = packageName;
    }

    // Update stats cards
    document.getElementById('activeCampaigns').textContent = dashboardData.activeCampaigns;
    document.getElementById('totalLeads').textContent = dashboardData.totalLeads.toLocaleString();
    document.getElementById('emailsSent').textContent = dashboardData.emailsSent.toLocaleString();
    document.getElementById('responseRate').textContent = dashboardData.responseRate + '%';

    // Update tokens section
    const tokenBalanceBig = document.getElementById('tokenBalanceBig');
    if (tokenBalanceBig) {
        tokenBalanceBig.textContent = dashboardData.tokens.toLocaleString();
    }

    const packageNameEl = document.getElementById('packageName');
    const purchaseDateEl = document.getElementById('purchaseDate');
    const paymentStatusEl = document.getElementById('paymentStatus');

    if (dashboardData.package) {
        packageNameEl.textContent = dashboardData.package.name;
        purchaseDateEl.textContent = new Date(dashboardData.package.purchaseDate).toLocaleDateString();
        paymentStatusEl.innerHTML = '<span class="status-badge status-active">Paid</span>';
    } else {
        packageNameEl.textContent = 'No active package';
        purchaseDateEl.textContent = '-';
        paymentStatusEl.innerHTML = '<span class="status-badge status-inactive">No active package</span>';
    }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Initialize dark mode
    initDarkMode();

    // Theme toggle button
    document.getElementById('themeToggle')?.addEventListener('click', toggleDarkMode);

    // Theme preference dropdown
    document.getElementById('themePreference')?.addEventListener('change', (e) => {
        const theme = e.target.value;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
        updateThemeIcon();
        showToast(`Theme set to ${theme}`, 'success');
    });

    // Section navigation
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.currentTarget.dataset.section;
            showSection(section);
        });
    });

    // Buy tokens buttons
    document.getElementById('buyTokensBtn')?.addEventListener('click', () => showSection('tokens'));
    document.getElementById('buyTokensQuickBtn')?.addEventListener('click', () => showSection('tokens'));

    // New campaign buttons
    document.getElementById('newCampaignBtn')?.addEventListener('click', showCampaignForm);
    document.getElementById('createCampaignBtn')?.addEventListener('click', showCampaignForm);

    // Campaign form handlers
    document.getElementById('cancelCampaignBtn')?.addEventListener('click', hideCampaignForm);
    document.getElementById('backToCampaignsBtn')?.addEventListener('click', () => {
        document.getElementById('campaignStatus').style.display = 'none';
        document.getElementById('campaignForm').style.display = 'block';
        showSection('campaigns');
    });
    document.getElementById('campaignForm')?.addEventListener('submit', handleCampaignSubmit);
    document.getElementById('previewBtn')?.addEventListener('click', handlePreviewClick);
    document.getElementById('leadSource')?.addEventListener('change', handleLeadSourceChange);

    // View analytics
    document.getElementById('viewAnalyticsBtn')?.addEventListener('click', () => showSection('analytics'));

    // Upload leads buttons
    document.getElementById('uploadLeadsBtn')?.addEventListener('click', showLeadsUpload);
    document.getElementById('cancelLeadsUploadBtn')?.addEventListener('click', hideLeadsUpload);
    document.getElementById('leadsCSVFile')?.addEventListener('change', handleLeadsFileSelect);
    document.getElementById('processLeadsBtn')?.addEventListener('click', processLeadsUpload);

    // Settings forms
    document.getElementById('accountSettingsForm')?.addEventListener('submit', handleAccountSettings);
    document.getElementById('emailSettingsForm')?.addEventListener('submit', handleEmailSettings);

    // Purchase package buttons
    document.querySelectorAll('.purchase-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const packageName = e.currentTarget.dataset.package;
            const price = e.currentTarget.dataset.price;
            const tokens = e.currentTarget.dataset.tokens;
            purchasePackage(packageName, price, tokens);
        });
    });

    // Contact sales
    document.getElementById('contactSalesBtn')?.addEventListener('click', () => {
        showToast('Please contact sales@outreachai.com for enterprise pricing', 'info');
    });

    // Modal controls
    document.getElementById('modalCloseBtn')?.addEventListener('click', hidePurchaseConfirmation);
    document.getElementById('modalCancelBtn')?.addEventListener('click', hidePurchaseConfirmation);
    document.getElementById('modalConfirmBtn')?.addEventListener('click', confirmPurchase);

    // Close modal on overlay click
    document.getElementById('confirmationModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'confirmationModal') {
            hidePurchaseConfirmation();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('confirmationModal');
            if (modal && modal.classList.contains('show')) {
                hidePurchaseConfirmation();
            }
        }
    });
}

/**
 * Show specific dashboard section
 */
function showSection(sectionName) {
    // Update sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        }
    });

    // Show section
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`)?.classList.add('active');
}

/**
 * Campaign Form Management
 */
function showCampaignForm() {
    // Check if user has tokens
    if (dashboardData.tokens === 0) {
        showToast('You need tokens to create a campaign. Please purchase a package first.', 'warning');
        showSection('tokens');
        return;
    }

    showSection('campaigns');
    document.getElementById('campaignsList').style.display = 'none';
    document.getElementById('campaignFormContainer').style.display = 'block';
    document.getElementById('campaignForm').reset();
}

function hideCampaignForm() {
    document.getElementById('campaignFormContainer').style.display = 'none';
    document.getElementById('campaignsList').style.display = 'block';
}

/**
 * Handle campaign form submission
 */
async function handleCampaignSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const launchButton = document.getElementById('launchCampaignBtn');

    // Validate form
    const targetAudience = formData.get('targetAudience');
    const valueProposition = formData.get('valueProposition');

    if (!targetAudience || targetAudience.length < 10) {
        showToast('Please provide a detailed target audience description', 'error');
        return;
    }

    if (!valueProposition || valueProposition.length < 20) {
        showToast('Please provide a clear value proposition', 'error');
        return;
    }

    // Disable button
    launchButton.disabled = true;
    launchButton.innerHTML = '<i data-lucide="loader"></i> Launching...';
    lucide.createIcons();

    try {
        // Format campaign data
        const campaignData = {
            campaignId: 'camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            userId: currentUser.uid,
            userEmail: currentUser.email,
            config: {
                name: formData.get('campaignName'),
                targetAudience: formData.get('targetAudience'),
                valueProposition: formData.get('valueProposition'),
                emailLimit: parseInt(formData.get('emailLimit')),
                leadSource: formData.get('leadSource'),
            },
            options: {
                abTesting: formData.get('abTesting') === 'on',
                autoFollowup: formData.get('autoFollowup') === 'on',
                spamCheck: formData.get('spamCheck') === 'on',
                crmSync: formData.get('crmSync') === 'on',
            }
        };

        // Save to Firestore
        await db.collection('campaigns').doc(campaignData.campaignId).set({
            ...campaignData,
            status: 'processing',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            leads: 0,
            emailsSent: 0,
            responses: {
                interested: 0,
                notInterested: 0,
                outOfOffice: 0,
                noResponse: 0
            }
        });

        // Call n8n webhook (if not localhost)
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            const response = await fetch(CONFIG.webhooks.launchCampaign, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(campaignData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }

        showToast('Campaign launched successfully!', 'success');

        // Show status panel
        document.getElementById('campaignForm').style.display = 'none';
        document.getElementById('campaignStatus').style.display = 'block';
        document.getElementById('statusCampaignId').textContent = campaignData.campaignId;
        document.getElementById('statusBadge').textContent = 'Processing';

        // Reload campaigns list after delay
        setTimeout(() => {
            hideCampaignForm();
        }, 3000);

    } catch (error) {
        console.error('Error launching campaign:', error);
        showToast(`Error: ${error.message}`, 'error');
        launchButton.disabled = false;
        launchButton.innerHTML = '<i data-lucide="send"></i> Launch Campaign';
        lucide.createIcons();
    }
}

/**
 * Handle email preview
 */
async function handlePreviewClick() {
    const form = document.getElementById('campaignForm');
    const formData = new FormData(form);

    const data = {
        targetAudience: formData.get('targetAudience'),
        valueProposition: formData.get('valueProposition'),
    };

    if (!data.targetAudience || !data.valueProposition) {
        showToast('Please fill in the target audience and value proposition first', 'warning');
        return;
    }

    showToast('Email preview feature coming soon!', 'info');
}

/**
 * Handle lead source change
 */
function handleLeadSourceChange(event) {
    const csvSection = document.getElementById('csvUploadSection');
    if (event.target.value === 'csv') {
        csvSection.style.display = 'block';
    } else {
        csvSection.style.display = 'none';
    }
}

/**
 * Leads Upload Management
 */
function showLeadsUpload() {
    document.getElementById('leadsList').style.display = 'none';
    document.getElementById('leadsUploadContainer').style.display = 'block';
}

function hideLeadsUpload() {
    document.getElementById('leadsUploadContainer').style.display = 'none';
    document.getElementById('leadsList').style.display = 'block';
    document.getElementById('leadsCSVFile').value = '';
    document.getElementById('uploadedFileName').textContent = 'No file selected';
    document.getElementById('processLeadsBtn').disabled = true;
}

function handleLeadsFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('uploadedFileName').textContent = file.name;
        document.getElementById('processLeadsBtn').disabled = false;
    }
}

async function processLeadsUpload() {
    const fileInput = document.getElementById('leadsCSVFile');
    const file = fileInput.files[0];

    if (!file) {
        showToast('Please select a CSV file', 'error');
        return;
    }

    const processBtn = document.getElementById('processLeadsBtn');
    processBtn.disabled = true;
    processBtn.innerHTML = '<i data-lucide="loader"></i> Processing...';
    lucide.createIcons();

    try {
        // Read CSV file
        const text = await file.text();
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Parse leads
        const leads = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim());
                const lead = {};
                headers.forEach((header, index) => {
                    lead[header] = values[index];
                });
                leads.push(lead);
            }
        }

        // Save to Firestore
        const batch = db.batch();
        leads.forEach(lead => {
            const docRef = db.collection('leads').doc();
            batch.set(docRef, {
                ...lead,
                userId: currentUser.uid,
                status: 'new',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();

        showToast(`Successfully uploaded ${leads.length} leads!`, 'success');
        hideLeadsUpload();

    } catch (error) {
        console.error('Error processing leads:', error);
        showToast('Error processing CSV file', 'error');
    } finally {
        processBtn.disabled = false;
        processBtn.innerHTML = '<i data-lucide="check"></i> Process Leads';
        lucide.createIcons();
    }
}

/**
 * Settings Handlers
 */
async function handleAccountSettings(event) {
    event.preventDefault();

    const displayName = document.getElementById('displayName').value;

    try {
        // Update Firebase Auth profile
        await currentUser.updateProfile({
            displayName: displayName
        });

        // Update Firestore
        await db.collection('users').doc(currentUser.uid).update({
            displayName: displayName
        });

        showToast('Account settings saved successfully!', 'success');

        // Update UI
        document.getElementById('userName').textContent = displayName || currentUser.email.split('@')[0];

    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Failed to save settings', 'error');
    }
}

async function handleEmailSettings(event) {
    event.preventDefault();

    const senderName = document.getElementById('senderName').value;
    const senderEmail = document.getElementById('senderEmail').value;

    try {
        // Save to Firestore
        await db.collection('users').doc(currentUser.uid).update({
            emailSettings: {
                senderName: senderName,
                senderEmail: senderEmail
            }
        });

        showToast('Email settings saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving email settings:', error);
        showToast('Failed to save email settings', 'error');
    }
}

/**
 * Package features data
 */
const packageFeatures = {
    starter: [
        '200 contacts/campaign',
        '50 emails/day',
        'AI personalization',
        'Basic lead generation'
    ],
    professional: [
        '1,000 contacts/campaign',
        '200 emails/day',
        'AI personalization (Advanced)',
        'Full lead generation',
        'A/B testing',
        'Advanced CRM sync'
    ],
    enterprise: [
        'Unlimited contacts',
        'Unlimited emails',
        'White-label solution',
        'Account manager',
        'A/B testing',
        'Advanced CRM sync'
    ]
};

// Store current package selection
let pendingPurchase = null;

/**
 * Show purchase confirmation modal
 */
function showPurchaseConfirmation(packageName, price, tokens) {
    // Store pending purchase data
    pendingPurchase = { packageName, price, tokens };

    // Update modal content
    document.getElementById('modalPackageName').textContent =
        packageName.charAt(0).toUpperCase() + packageName.slice(1);
    document.getElementById('modalPackagePrice').textContent = price;
    document.getElementById('modalTokenAmount').textContent =
        parseInt(tokens).toLocaleString() + ' tokens';

    // Update features list
    const featuresList = document.getElementById('modalPackageFeatures');
    featuresList.innerHTML = '';

    const features = packageFeatures[packageName] || [];
    features.forEach(feature => {
        const li = document.createElement('li');
        li.innerHTML = `
            <i data-lucide="check"></i>
            <span>${feature}</span>
        `;
        featuresList.appendChild(li);
    });

    // Show modal
    const modal = document.getElementById('confirmationModal');
    modal.classList.add('show');

    // Re-initialize icons
    lucide.createIcons();
}

/**
 * Hide purchase confirmation modal
 */
function hidePurchaseConfirmation() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.remove('show');
    pendingPurchase = null;
}

/**
 * Confirm and process package purchase
 */
async function confirmPurchase() {
    if (!pendingPurchase) return;

    const { packageName, price, tokens } = pendingPurchase;
    const confirmBtn = document.getElementById('modalConfirmBtn');

    try {
        // Show loading state
        confirmBtn.classList.add('loading');
        confirmBtn.disabled = true;

        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Update user data in Firestore
        await db.collection('users').doc(currentUser.uid).update({
            tokens: firebase.firestore.FieldValue.increment(parseInt(tokens)),
            package: {
                name: packageName.charAt(0).toUpperCase() + packageName.slice(1),
                price: parseInt(price),
                tokens: parseInt(tokens),
                purchaseDate: new Date().toISOString(),
                paymentStatus: 'paid'
            },
            lastPurchase: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Hide modal
        hidePurchaseConfirmation();

        // Show success message
        showToast(`Successfully purchased ${packageName} package! ${tokens} tokens added to your account.`, 'success');

        // Navigate to overview
        showSection('overview');

    } catch (error) {
        console.error('Error purchasing package:', error);
        showToast('Failed to purchase package. Please try again.', 'error');
    } finally {
        // Remove loading state
        confirmBtn.classList.remove('loading');
        confirmBtn.disabled = false;
    }
}

/**
 * Purchase package - Updated to show confirmation
 */
function purchasePackage(packageName, price, tokens) {
    showPurchaseConfirmation(packageName, price, tokens);
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        // Unsubscribe from listeners
        if (unsubscribeUserData) {
            unsubscribeUserData();
        }

        await firebaseAuth.signOut();
        console.log('✅ Logged out successfully');
        showToast('Logged out successfully', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('❌ Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;

    const icon = toast.querySelector('i');
    if (type === 'success') {
        icon.setAttribute('data-lucide', 'check-circle');
    } else if (type === 'error') {
        icon.setAttribute('data-lucide', 'x-circle');
    } else if (type === 'warning') {
        icon.setAttribute('data-lucide', 'alert-circle');
    } else if (type === 'info') {
        icon.setAttribute('data-lucide', 'info');
    }

    lucide.createIcons();

    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.ui.toastDuration);
}

/**
 * Dark Mode Management
 */
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const themePreference = document.getElementById('themePreference');

    // Apply saved theme or default to auto
    const theme = savedTheme || 'auto';

    if (themePreference) {
        themePreference.value = theme;
    }

    applyTheme(theme);
    updateThemeIcon();
}

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

function updateThemeIcon() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const themeIcon = document.getElementById('themeIcon');
    if (themeIcon) {
        themeIcon.setAttribute('data-lucide', currentTheme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update dropdown if exists
    const themePreference = document.getElementById('themePreference');
    if (themePreference) {
        themePreference.value = newTheme;
    }

    updateThemeIcon();
    showToast(`Switched to ${newTheme} mode`, 'success');
}

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
