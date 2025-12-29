/**
 * OutreachAI Main Application
 *
 * Handles all client-side interactions including:
 * - Dark mode toggle
 * - Form validation and submission
 * - Campaign management
 * - n8n webhook integration
 * - UI updates and notifications
 */

// ====================================
// Utility Functions
// ====================================

/**
 * Smooth scroll to element
 */
function smoothScroll(targetId) {
    const element = document.querySelector(targetId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Format form data for n8n webhook
 */
function formatCampaignData(formData) {
    return {
        campaignId: OutreachUtils.campaign.generateId(),
        timestamp: new Date().toISOString(),
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
}

// ====================================
// Campaign Management
// ====================================

/**
 * Launch campaign via n8n webhook
 */
async function launchCampaign(campaignData) {
    try {
        // Show loading state
        showCampaignStatus(campaignData.campaignId);

        // Add user data if authenticated
        if (window.firebaseAuth && window.firebaseAuth.currentUser) {
            campaignData.userId = window.firebaseAuth.currentUser.uid;
            campaignData.userEmail = window.firebaseAuth.currentUser.email;
        }

        // In development mode, use mock response
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📤 Launching campaign (MOCK):', campaignData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Save to Firestore if user is authenticated
            if (campaignData.userId && firebase.firestore) {
                const db = firebase.firestore();
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
                console.log('✅ Campaign saved to Firestore');
            }

            // Mock successful response
            return {
                success: true,
                campaignId: campaignData.campaignId,
                status: 'processing',
                message: 'Campaign launched successfully!',
                estimatedLeads: Math.floor(Math.random() * 50) + 20,
            };
        }

        // Production: Save to Firestore first
        if (campaignData.userId && firebase.firestore) {
            const db = firebase.firestore();
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
        }

        // Production: Call actual n8n webhook
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

        const result = await response.json();
        return result;

    } catch (error) {
        console.error('❌ Error launching campaign:', error);
        throw error;
    }
}

/**
 * Check campaign status
 */
async function checkCampaignStatus(campaignId) {
    try {
        // Mock response in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return {
                campaignId: campaignId,
                status: 'active',
                leads: Math.floor(Math.random() * 100) + 50,
                emailsSent: Math.floor(Math.random() * 80) + 20,
                totalLeads: 100,
                progress: Math.floor(Math.random() * 100),
            };
        }

        // Production: Call n8n webhook
        const response = await fetch(`${CONFIG.webhooks.checkStatus}?campaignId=${campaignId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('❌ Error checking campaign status:', error);
        throw error;
    }
}

/**
 * Preview email generation
 */
async function previewEmail(data) {
    try {
        OutreachUtils.toast.show('Generating preview...', 'warning');

        // Mock response in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            await new Promise(resolve => setTimeout(resolve, 1500));

            return {
                subject: 'Quick question about [Company Name]',
                body: `Hi [Name],\n\nI noticed that [Company] is ${data.targetAudience.split(' ').slice(0, 5).join(' ')}...\n\n${data.valueProposition}\n\nWould you be open to a quick 15-minute chat next week?\n\nBest regards,\n[Your Name]`
            };
        }

        // Production: Call n8n webhook
        const response = await fetch(CONFIG.webhooks.previewEmail, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('❌ Error generating preview:', error);
        throw error;
    }
}

// ====================================
// UI Updates
// ====================================

/**
 * Show campaign status panel
 */
function showCampaignStatus(campaignId) {
    const statusPanel = document.getElementById('campaignStatus');
    const form = document.getElementById('campaignForm');

    document.getElementById('statusCampaignId').textContent = campaignId;
    document.getElementById('statusBadge').textContent = 'Processing';
    document.getElementById('statusLeads').textContent = '0';
    document.getElementById('statusEmails').textContent = '0 / 0';
    document.getElementById('progressFill').style.width = '0%';

    form.style.display = 'none';
    statusPanel.style.display = 'block';
}

/**
 * Update campaign status panel
 */
function updateCampaignStatus(data) {
    document.getElementById('statusLeads').textContent = data.leads;
    document.getElementById('statusEmails').textContent = `${data.emailsSent} / ${data.totalLeads}`;
    document.getElementById('progressFill').style.width = `${data.progress}%`;

    const badge = document.getElementById('statusBadge');
    badge.textContent = data.status.charAt(0).toUpperCase() + data.status.slice(1);

    if (data.status === 'completed') {
        badge.style.background = 'var(--success)';
    }
}

/**
 * Show email preview modal
 */
function showEmailPreview(emailData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Email Preview</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="email-preview">
                    <div class="email-field">
                        <strong>Subject:</strong>
                        <p>${emailData.subject}</p>
                    </div>
                    <div class="email-field">
                        <strong>Body:</strong>
                        <pre>${emailData.body}</pre>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    lucide.createIcons();

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// ====================================
// Event Handlers
// ====================================

/**
 * Handle form submission
 */
async function handleCampaignSubmit(event) {
    event.preventDefault();

    // Check if user is authenticated
    if (!window.firebaseAuth || !window.firebaseAuth.currentUser) {
        OutreachUtils.toast.show('Please login to launch a campaign', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const form = event.target;
    const formData = new FormData(form);
    const launchButton = document.getElementById('launchCampaignBtn');

    // Validate form
    const targetAudience = formData.get('targetAudience');
    const valueProposition = formData.get('valueProposition');

    if (!targetAudience || targetAudience.length < 10) {
        OutreachUtils.toast.show('Please provide a detailed target audience description', 'error');
        return;
    }

    if (!valueProposition || valueProposition.length < 20) {
        OutreachUtils.toast.show('Please provide a clear value proposition', 'error');
        return;
    }

    // Disable button
    launchButton.disabled = true;
    launchButton.innerHTML = '<i data-lucide="loader"></i> Launching...';
    lucide.createIcons();

    try {
        // Format and submit campaign data
        const campaignData = formatCampaignData(formData);
        const result = await launchCampaign(campaignData);

        if (result.success) {
            OutreachUtils.toast.show(result.message || 'Campaign launched successfully!', 'success');

            // Start polling for status updates
            const intervalId = setInterval(async () => {
                try {
                    const status = await checkCampaignStatus(result.campaignId);
                    updateCampaignStatus(status);

                    if (status.status === 'completed' || status.status === 'failed') {
                        clearInterval(intervalId);
                    }
                } catch (error) {
                    console.error('Error polling status:', error);
                    clearInterval(intervalId);
                }
            }, CONFIG.ui.statusPollInterval);
        } else {
            throw new Error(result.message || 'Failed to launch campaign');
        }

    } catch (error) {
        OutreachUtils.toast.show(`Error: ${error.message}`, 'error');
        launchButton.disabled = false;
        launchButton.innerHTML = '<i data-lucide="send"></i> Launch Campaign';
        lucide.createIcons();
    }
}

/**
 * Handle preview button click
 */
async function handlePreviewClick() {
    // Check if user is authenticated
    if (!window.firebaseAuth || !window.firebaseAuth.currentUser) {
        OutreachUtils.toast.show('Please login to preview emails', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }

    const form = document.getElementById('campaignForm');
    const formData = new FormData(form);

    const data = {
        targetAudience: formData.get('targetAudience'),
        valueProposition: formData.get('valueProposition'),
    };

    if (!data.targetAudience || !data.valueProposition) {
        OutreachUtils.toast.show('Please fill in the target audience and value proposition first', 'warning');
        return;
    }

    try {
        const emailData = await previewEmail(data);
        showEmailPreview(emailData);
        OutreachUtils.toast.show('Preview generated!', 'success');
    } catch (error) {
        OutreachUtils.toast.show('Failed to generate preview', 'error');
    }
}

// ====================================
// Initialization
// ====================================

/**
 * Initialize application
 */
function initApp() {
    console.log('🚀 OutreachAI initialized');

    // Initialize dark mode
    OutreachUtils.darkMode.init();

    // Theme toggle button
    document.getElementById('themeToggle')?.addEventListener('click', OutreachUtils.darkMode.toggle);

    // Navigation smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            smoothScroll(targetId);
        });
    });

    // Hero CTA button
    document.getElementById('heroCtaBtn')?.addEventListener('click', () => {
        smoothScroll('#campaign');
    });

    // Watch demo button (placeholder)
    document.getElementById('watchDemoBtn')?.addEventListener('click', () => {
        OutreachUtils.toast.show('Demo video coming soon!', 'warning');
    });

    // Campaign form submission
    const campaignForm = document.getElementById('campaignForm');
    if (campaignForm) {
        campaignForm.addEventListener('submit', handleCampaignSubmit);
    }

    // Preview button
    document.getElementById('previewBtn')?.addEventListener('click', handlePreviewClick);

    // Lead source dropdown
    document.getElementById('leadSource')?.addEventListener('change', OutreachUtils.leadSource.handleChange);

    // View dashboard button
    document.getElementById('viewDashboardBtn')?.addEventListener('click', () => {
        OutreachUtils.toast.show('Dashboard feature coming soon!', 'warning');
    });

    // Login/Signup buttons
    document.getElementById('loginBtn')?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    document.getElementById('signupBtn')?.addEventListener('click', () => {
        smoothScroll('#campaign');
    });

    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    mobileMenuToggle?.addEventListener('click', () => {
        mobileMenu?.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        const isActive = mobileMenu?.classList.contains('active');
        icon?.setAttribute('data-lucide', isActive ? 'x' : 'menu');
        lucide.createIcons();
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu?.classList.remove('active');
            const icon = mobileMenuToggle?.querySelector('i');
            icon?.setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });

    // Initialize Lucide icons
    lucide.createIcons();

    // Add fade-in animation to sections
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Add modal styles dynamically
const modalStyles = `
<style>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
}

.modal-content {
    background: white;
    border-radius: var(--radius-xl);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-xl);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xl);
    border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
    font-size: var(--font-size-2xl);
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--spacing-sm);
    color: var(--gray-600);
}

.modal-close:hover {
    color: var(--gray-900);
}

.modal-body {
    padding: var(--spacing-xl);
}

.email-preview {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.email-field strong {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--gray-700);
}

.email-field p,
.email-field pre {
    padding: var(--spacing-md);
    background: var(--gray-100);
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
}

.email-field pre {
    white-space: pre-wrap;
    font-family: var(--font-family);
    line-height: 1.7;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);

// ====================================
// Language Switcher Implementation
// ====================================
let currentLanguage = 'en';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'tr' : 'en';
    document.getElementById('langText').textContent = currentLanguage.toUpperCase();
    updateLanguage();
    localStorage.setItem('preferredLanguage', currentLanguage);
}

function updateLanguage() {
    const elements = document.querySelectorAll('[data-lang-en]');
    elements.forEach(element => {
        const text = currentLanguage === 'en'
            ? element.getAttribute('data-lang-en')
            : element.getAttribute('data-lang-tr');

        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else if (element.tagName === 'BUTTON') {
            element.textContent = text;
        } else {
            element.textContent = text;
        }
    });

    // Re-initialize icons after text changes
    lucide.createIcons();
}

// Load saved language preference
document.addEventListener('DOMContentLoaded', function() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        currentLanguage = savedLang;
        document.getElementById('langText').textContent = currentLanguage.toUpperCase();
        updateLanguage();
    }
});

// ====================================
// Investor Modal Implementation
// ====================================
function openInvestorModal() {
    document.getElementById('investorModal').classList.add('active');
}

function closeInvestorModal() {
    document.getElementById('investorModal').classList.remove('active');
}

// Close modal when clicking outside
document.getElementById('investorModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeInvestorModal();
    }
});

// Handle investor form submission
function handleInvestorSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('investorName').value;
    const email = document.getElementById('investorEmail').value;
    const phone = document.getElementById('investorPhone').value;

    // Here you can add your backend integration
    // For now, we'll just log and show success message
    console.log('Investor Lead:', { name, email, phone });

    // Show success message
    const successMessage = currentLanguage === 'en'
        ? 'Thank you! We will contact you soon.'
        : 'Teşekkürler! Yakında sizinle iletişime geçeceğiz.';

    if (window.showToast) {
        showToast(successMessage, 'success');
    } else {
        alert(successMessage);
    }

    // Reset form and close modal
    document.getElementById('investorForm').reset();
    closeInvestorModal();

    // Optional: Send to your backend
    // fetch('/api/investor-leads', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name, email, phone })
    // });
}

// Initialize Lucide icons
lucide.createIcons();

// ====================================
// Authentication State Management
// ====================================

/**
 * Check if user is authenticated
 */
function checkAuth() {
    firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
            // User is logged in
            console.log('✅ Authenticated user:', user.email);
            updateNavForAuthenticatedUser(user);
        } else {
            // User is not logged in
            console.log('ℹ️ User not authenticated');
            updateNavForGuestUser();
        }
    });
}

/**
 * Update navigation for authenticated user
 */
function updateNavForAuthenticatedUser(user) {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (loginBtn && signupBtn) {
        // Replace login/signup buttons with user panel and logout
        const userMenuHtml = `
            <div class="user-menu" style="display: flex; align-items: center; gap: 1rem;">
                <button class="btn btn-primary" id="userPanelBtn" style="height: 38px; padding: 0.625rem 1.25rem;" onclick="window.location.href='user.html'">
                    <i data-lucide="layout-dashboard"></i>
                    User Panel
                </button>
                <button class="btn btn-secondary" id="logoutBtn" style="height: 38px; padding: 0.625rem 1.25rem;">
                    <i data-lucide="log-out"></i>
                    Logout
                </button>
            </div>
        `;

        const navActions = document.querySelector('.nav-actions');
        const themeToggle = navActions.querySelector('.theme-toggle');

        // Clear existing buttons
        loginBtn.remove();
        signupBtn.remove();

        // Add user menu
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = userMenuHtml;
        const userMenu = tempDiv.firstElementChild;
        navActions.appendChild(userMenu);

        // Re-init icons
        lucide.createIcons();

        // Add logout handler
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    }

    // Update hero CTA button
    const heroCtaBtn = document.getElementById('heroCtaBtn');
    if (heroCtaBtn) {
        heroCtaBtn.innerHTML = '<i data-lucide="layout-dashboard"></i> Go to Dashboard';
        heroCtaBtn.onclick = () => window.location.href = 'user.html';
        lucide.createIcons();
    }

    // Hide campaign section for logged-in users
    const campaignSection = document.getElementById('campaign');
    if (campaignSection) {
        campaignSection.style.display = 'none';
    }
}

/**
 * Update navigation for guest user
 */
function updateNavForGuestUser() {
    // Guest users see default login/signup buttons
    // No changes needed as they are already in the HTML
}

/**
 * Handle logout
 */
async function handleLogout() {
    try {
        await firebaseAuth.signOut();
        console.log('✅ Logged out successfully');

        // Show toast notification if available
        if (window.showToast) {
            showToast('Logged out successfully', 'success');
        }

        // Redirect to home page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    } catch (error) {
        console.error('❌ Logout error:', error);
        if (window.showToast) {
            showToast('Logout failed. Please try again.', 'error');
        }
    }
}

// Initialize authentication check
checkAuth();

