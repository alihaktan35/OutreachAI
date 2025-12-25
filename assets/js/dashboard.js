/**
 * OutreachAI Dashboard
 * Main dashboard functionality and state management
 */

// Use global Firestore instance from firebase-config.js
// firebaseDb is available as window.firebaseDb (set in firebase-config.js)
const firebaseDb = window.firebaseDb || null;
let currentUser = null;
let unsubscribeUserData = null;
let n8nStatusManager = null;
let campaignLauncher = null;

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

        // Initialize n8n Status Manager
        n8nStatusManager = new N8NStatusManager();
        n8nStatusManager.startMonitoring();

        // Initialize Campaign Launcher
        campaignLauncher = new CampaignLauncher(n8nStatusManager);

        // Use the already initialized Firestore from firebase-config.js
        // (window.firebaseDb is already set in firebase-config.js)

        // Initialize Campaign Manager
        if (typeof campaignManager !== 'undefined') {
            campaignManager.initialize(firebaseDb, user);
        }

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
        const userDoc = await firebaseDb.collection('users').doc(userId).get();

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

                // Update the welcome message with displayName from Firestore
                const userNameElement = document.getElementById('userName');
                if (userNameElement) {
                    userNameElement.textContent = userData.displayName;
                }
            }
            document.getElementById('userEmail').value = userData.email;

            if (userData.emailSettings) {
                document.getElementById('senderName').value = userData.emailSettings.senderName || '';
                document.getElementById('senderEmail').value = userData.emailSettings.senderEmail || '';
            }

        } else {
            // Create new user document
            await firebaseDb.collection('users').doc(userId).set({
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
        OutreachUtils.toast.show('Failed to load user data', 'error');
    }
}

/**
 * Setup realtime listeners for user data
 */
function setupRealtimeListeners(userId) {
    // Listen to user document changes
    unsubscribeUserData = firebaseDb.collection('users').doc(userId)
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

                // Update displayName in welcome message if it exists
                if (userData.displayName) {
                    const userNameElement = document.getElementById('userName');
                    if (userNameElement) {
                        userNameElement.textContent = userData.displayName;
                    }
                }

                updateDashboardUI();
            }
        });
    
    // Listen for campaigns with ready drafts
    firebaseDb.collection('campaigns')
        .where('userId', '==', userId)
        .where('status', '==', 'drafts_ready')
        .onSnapshot(snapshot => {
            const campaignsWithDrafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            campaignDrafts = campaignsWithDrafts; // Store in local state
            renderCampaignDrafts(campaignsWithDrafts);
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
    OutreachUtils.darkMode.init();

    // Theme toggle button
    document.getElementById('themeToggle')?.addEventListener('click', OutreachUtils.darkMode.toggle);

    // Theme preference dropdown
    document.getElementById('themePreference')?.addEventListener('change', (e) => {
        const theme = e.target.value;
        localStorage.setItem('theme', theme);
        OutreachUtils.darkMode.applyTheme(theme);
        updateThemeIcon();
        OutreachUtils.toast.show(`Theme set to ${theme}`, 'success');
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
    
    // Suggest Domains button
    document.getElementById('suggestDomainsBtn')?.addEventListener('click', () => {
        const mainDomain = document.getElementById('mainDomainInput').value.trim();
        const suggestions = suggestDomains(mainDomain);
        renderSuggestedDomains(suggestions);
    });

    // Delegated event listener for copying suggested domains
    document.getElementById('suggestedDomainsOutput')?.addEventListener('click', (e) => {
        if (e.target.closest('.copy-domain-btn')) {
            const domainToCopy = e.target.closest('.copy-domain-btn').dataset.domain;
            navigator.clipboard.writeText(domainToCopy).then(() => {
                OutreachUtils.toast.show(`Copied "${domainToCopy}" to clipboard!`, 'success');
            }).catch(err => {
                console.error('Failed to copy domain: ', err);
                OutreachUtils.toast.show('Failed to copy domain.', 'error');
            });
        }
    });

    // View analytics button now views domains
    document.getElementById('viewAnalyticsBtn')?.addEventListener('click', () => showSection('domains'));

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
        OutreachUtils.toast.show('Please contact sales@outreachai.com for enterprise pricing', 'info');
    });

    // Modal controls
    document.getElementById('modalCloseBtn')?.addEventListener('click', hidePurchaseConfirmation);
    document.getElementById('modalCancelBtn')?.addEventListener('click', hidePurchaseConfirmation);
    document.getElementById('modalConfirmBtn')?.addEventListener('click', confirmPurchase);

    // Close modal on outside click
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

    // Delegated event listeners for drafts
    const draftsList = document.getElementById('draftsList');
    if (draftsList) {
        draftsList.addEventListener('click', e => {
            if (e.target.closest('.save-draft-btn')) {
                handleDraftSave(e);
            }
            if (e.target.closest('.send-campaign-btn')) {
               handleSendCampaign(e);
            }
        });
    }
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
        OutreachUtils.toast.show('You need tokens to create a campaign. Please purchase a package first.', 'warning');
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

    // Helper function to parse contacts from CSV
    const parseContacts = (csvText) => {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map(h => h.trim());
        const contacts = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const contact = {};
            headers.forEach((header, index) => {
                contact[header] = values[index] ? values[index].trim() : '';
            });
            contacts.push(contact);
        }
        return contacts;
    };

    // --- Validation ---
    const csvFile = document.getElementById('csvFile').files[0];
    if (!csvFile) {
        OutreachUtils.toast.show('❌ Please upload a CSV file', 'error');
        return;
    }

    launchButton.disabled = true;
    launchButton.innerHTML = '<i data-lucide="loader"></i> Launching...';
    lucide.createIcons();

    try {
        const campaignId = 'camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const csvData = await CSVHandler.readFile(csvFile);
        const contacts = parseContacts(csvData);

        if (contacts.length === 0) {
            OutreachUtils.toast.show('❌ CSV file appears to be empty or invalid.', 'error');
            launchButton.disabled = false;
            launchButton.innerHTML = '<i data-lucide="send"></i> Launch Campaign';
            lucide.createIcons();
            return;
        }

        // --- Build the correct campaign object ---
        const campaignRecord = {
            campaignId: campaignId,
            userId: currentUser.uid,
            campaignName: formData.get('campaignName') || 'Untitled Campaign',
            contactCount: contacts.length,
            status: 'generating',
            emailsSent: 0,
            emailsTotal: contacts.length,
            successCount: 0,
            failureCount: 0,
            createdAt: firebase.firestore.Timestamp.now(),
            timestamp: new Date().toISOString(),
            senderInfo: {
                name: formData.get('senderName'),
                title: formData.get('senderTitle'),
                company: formData.get('senderCompany'),
                email: formData.get('senderEmailAddress'),
                phone: formData.get('senderPhone')
            },
            contacts: contacts.map(c => ({
                name: c.name || '',
                email: c.email || '',
                company: c.company || '',
                position: c.position || '',
                industry: c.industry || '',
                notes: c.notes || ''
            }))
        };

        // --- Save to Firestore ---
        await firebaseDb.collection('campaigns').doc(campaignId).set(campaignRecord);

        // --- Trigger n8n Webhook ---
        await campaignLauncher.launchCampaign(campaignId, formData, csvData);

        OutreachUtils.toast.show('Draft generation initiated!', 'success');

        // Show status panel and hide form
        document.getElementById('campaignFormContainer').style.display = 'none';
        document.getElementById('campaignsList').style.display = 'block';
        showSection('campaigns');

    } catch (error) {
        console.error('Error launching campaign:', error);
        OutreachUtils.toast.show(`Error: ${error.message}`, 'error');
        launchButton.disabled = false;
        launchButton.innerHTML = '<i data-lucide="send"></i> Launch Campaign';
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
        await firebaseDb.collection('users').doc(currentUser.uid).update({
            displayName: displayName
        });

        OutreachUtils.toast.show('Account settings saved successfully!', 'success');

        // Update UI
        document.getElementById('userName').textContent = displayName || currentUser.email.split('@')[0];

    } catch (error) {
        console.error('Error saving settings:', error);
        OutreachUtils.toast.show('Failed to save settings', 'error');
    }
}

async function handleEmailSettings(event) {
    event.preventDefault();

    const senderName = document.getElementById('senderName').value;
    const senderEmail = document.getElementById('senderEmail').value;

    try {
        // Save to Firestore
        await firebaseDb.collection('users').doc(currentUser.uid).update({
            emailSettings: {
                senderName: senderName,
                senderEmail: senderEmail
            }
        });

        OutreachUtils.toast.show('Email settings saved successfully!', 'success');

    } catch (error) {
        console.error('Error saving email settings:', error);
        OutreachUtils.toast.show('Failed to save email settings', 'error');
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
        await firebaseDb.collection('users').doc(currentUser.uid).update({
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
        OutreachUtils.toast.show(`Successfully purchased ${packageName} package! ${tokens} tokens added to your account.`, 'success');

        // Navigate to overview
        showSection('overview');

    } catch (error) {
        console.error('Error purchasing package:', error);
        OutreachUtils.toast.show('Failed to purchase package. Please try again.', 'error');
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
        OutreachUtils.toast.show('Logged out successfully', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('❌ Logout error:', error);
        OutreachUtils.toast.show('Logout failed. Please try again.', 'error');
    }
}

// Global state for drafts
let campaignDrafts = [];

/**
 * Render campaign drafts
 */
function renderCampaignDrafts(campaigns) {
    const draftsList = document.getElementById('draftsList');
    if (!draftsList) return;

    if (campaigns.length === 0) {
        draftsList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="mail-check"></i>
                <p>No drafts ready for review</p>
                <span>Campaigns with a 'generating' status will appear here once drafts are ready.</span>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    draftsList.innerHTML = campaigns.map(campaign => `
        <div class="campaign-draft-group" data-campaign-id="${campaign.id}">
            <div class="campaign-draft-header">
                <div>
                    <h3>${campaign.campaignName}</h3>
                    <p>${campaign.drafts?.length || 0} drafts ready for review</p>
                </div>
                <button class="btn btn-primary send-campaign-btn" data-campaign-id="${campaign.id}">
                    <i data-lucide="send"></i>
                    Send Campaign
                </button>
            </div>
            <div class="draft-cards-container">
                ${(campaign.drafts || []).map((draft, index) => `
                    <div class="draft-card" data-campaign-id="${campaign.id}" data-draft-index="${index}">
                        <div class="draft-card-header">
                            <i data-lucide="user-circle"></i>
                            <span>To: ${draft.recipientName || draft.recipientEmail}</span>
                        </div>
                        <div class="form-group">
                            <label>Subject</label>
                            <input type="text" class="form-input draft-subject" value="${draft.subject}">
                        </div>
                        <div class="form-group">
                            <label>Body</label>
                            <textarea class="form-input draft-body" rows="8">${draft.body}</textarea>
                        </div>
                        <div class="draft-card-footer">
                            <button class="btn btn-sm btn-secondary save-draft-btn">
                                <i data-lucide="save"></i>
                                Save Changes
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    lucide.createIcons();
}

/**
 * Handle draft save
 */
function handleDraftSave(event) {
    const card = event.target.closest('.draft-card');
    const campaignId = card.dataset.campaignId;
    const draftIndex = parseInt(card.dataset.draftIndex, 10);

    const campaign = campaignDrafts.find(c => c.id === campaignId);
    if (campaign && campaign.drafts[draftIndex]) {
        const subject = card.querySelector('.draft-subject').value;
        const body = card.querySelector('.draft-body').value;

        // Update local state
        campaign.drafts[draftIndex].subject = subject;
        campaign.drafts[draftIndex].body = body;

        OutreachUtils.toast.show('Changes saved locally!', 'success');
    }
}

/**
 * Handle send campaign
 */
async function handleSendCampaign(event) {
    const button = event.target.closest('.send-campaign-btn');
    const campaignId = button.dataset.campaignId;
    const campaign = campaignDrafts.find(c => c.id === campaignId);

    if (!campaign) {
        OutreachUtils.toast.show('Could not find campaign data.', 'error');
        return;
    }

    button.disabled = true;
    button.innerHTML = '<i data-lucide="loader"></i> Sending...';
    lucide.createIcons();

    try {
        // Here you would call the n8n webhook to send the campaign
        console.log('Sending campaign:', campaign.id, 'with drafts:', campaign.drafts);

        // ** SIMULATE WEBHOOK CALL **
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // After sending, update the campaign status in Firestore
        // This will remove it from the drafts view
        await firebaseDb.collection('campaigns').doc(campaignId).update({
            status: 'processing', // Or 'sent', 'in_progress'
            drafts: campaign.drafts // Save the final, possibly edited, drafts
        });

        OutreachUtils.toast.show(`Campaign "${campaign.campaignName}" has been sent!`, 'success');

    } catch (error) {
        console.error('Error sending campaign:', error);
        OutreachUtils.toast.show('Failed to send campaign.', 'error');
        button.disabled = false;
        button.innerHTML = '<i data-lucide="send"></i> Send Campaign';
        lucide.createIcons();
    }
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
        OutreachUtils.toast.show('Logged out successfully', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('❌ Logout error:', error);
        OutreachUtils.toast.show('Logout failed. Please try again.', 'error');
    }
}

/**
 * Generates suggested email domains based on a main domain.
 * @param {string} mainDomain The client's main domain (e.g., 'suzuki.com').
 * @returns {Array<string>} A list of suggested domains.
 */
function suggestDomains(mainDomain) {
    if (!mainDomain) return [];

    const domainParts = mainDomain.split('.');
    if (domainParts.length < 2) return [];

    const name = domainParts[0]; // e.g., 'suzuki'
    const tld = domainParts.slice(1).join('.'); // e.g., 'com'

    const suggestions = new Set();

    // Common prefixes/suffixes
    suggestions.add(`get${name}.${tld}`);
    suggestions.add(`try${name}.${tld}`);
    suggestions.add(`${name}mail.${tld}`);
    suggestions.add(`${name}leads.${tld}`);
    suggestions.add(`${name}connect.${tld}`);

    // If TLD is .com, try other common TLDs
    if (tld === 'com') {
        suggestions.add(`${name}.net`);
        suggestions.add(`${name}.org`);
        suggestions.add(`${name}.co`);
    } else {
        suggestions.add(`${name}.com`);
    }

    // Add dashes
    if (name.length > 4) {
        suggestions.add(`${name.slice(0, name.length / 2)}-${name.slice(name.length / 2)}.${tld}`);
    }

    // Add numbers
    suggestions.add(`${name}247.${tld}`);
    suggestions.add(`${name}hq.${tld}`);

    return Array.from(suggestions).filter(d => d !== mainDomain);
}

/**
 * Renders the suggested domains in the UI.
 * @param {Array<string>} domains A list of suggested domain names.
 */
function renderSuggestedDomains(domains) {
    const outputDiv = document.getElementById('suggestedDomainsOutput');
    if (!outputDiv) return;

    if (domains.length === 0) {
        outputDiv.innerHTML = `
            <div class="empty-state">
                <i data-lucide="globe"></i>
                <p>No suggestions found or invalid domain entered.</p>
                <span>Try a different main domain.</span>
            </div>
        `;
    } else {
        outputDiv.innerHTML = domains.map(domain => `
            <div class="domains-list-card">
                <span>${domain}</span>
                <button class="btn btn-sm btn-primary copy-domain-btn" data-domain="${domain}">
                    <i data-lucide="copy"></i> Copy
                </button>
            </div>
        `).join('');
    }
    lucide.createIcons();
}


// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

const draftStyles = `
<style>
.campaign-draft-group {
    background: var(--background-secondary);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-color);
}
.campaign-draft-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}
.campaign-draft-header h3 {
    margin: 0;
    font-size: var(--font-size-xl);
}
.campaign-draft-header p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}
.draft-cards-container {
    padding: var(--spacing-lg);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
}
.draft-card {
    background: var(--background-primary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
}
.draft-card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color-soft);
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
}
.draft-card .form-group {
    padding: var(--spacing-md);
}
.draft-card .form-group label {
    font-weight: 500;
    font-size: var(--font-size-sm);
    margin-bottom: var(--spacing-xs);
}
.draft-card-footer {
    padding: var(--spacing-md);
    text-align: right;
    border-top: 1px solid var(--border-color-soft);
}
.draft-body {
    min-height: 150px;
    font-size: var(--font-size-sm);
    line-height: 1.6;
}
</style>
`;

const domainStyles = `
<style>
.domains-content {
    background: var(--background-secondary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--border-color);
}
.suggested-domains-output {
    margin-top: var(--spacing-xl);
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--spacing-md);
}
.domains-list-card {
    background: var(--background-primary);
    border-radius: var(--radius-md);
    padding: var(--spacing-md);
    border: 1px solid var(--border-color-soft);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    font-size: var(--font-size-md);
}
.copy-domain-btn {
    margin-left: var(--spacing-md);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', draftStyles);
document.head.insertAdjacentHTML('beforeend', domainStyles);
