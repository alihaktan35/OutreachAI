/**
 * Campaign Manager - Firebase Integration
 * Saves and displays campaign data
 */

class CampaignManager {
    constructor() {
        this.firebaseDb = null;
        this.currentUser = null;
        this.campaignsListElement = document.getElementById('campaignsList');
    }

    initialize(firebaseDb, user) {
        this.firebaseDb = firebaseDb;
        this.currentUser = user;
        this.loadCampaigns();
    }

    /**
     * Save campaign to Firebase
     */
    async saveCampaign(campaignData) {
        if (!this.firebaseDb || !this.currentUser) {
            console.error('Firebase not initialized or user not logged in');
            return null;
        }

        try {
            const campaignId = OutreachUtils.campaign.generateId();

            const campaign = {
                campaignId: campaignId,
                userId: this.currentUser.uid,
                campaignName: campaignData.campaignName,
                status: 'generating',
                createdAt: firebase.firestore.Timestamp.now(),
                contacts: campaignData.contacts || [],
                emailsSent: 0,
                emailsTotal: campaignData.contacts?.length || 0,
                successCount: 0,
                failureCount: 0,
                csvData: campaignData.csvData || '',
                metadata: {
                    userEmail: this.currentUser.email,
                    timestamp: new Date().toISOString()
                }
            };

            await this.firebaseDb.collection('campaigns').doc(campaignId).set(campaign);

            console.log('✅ Campaign saved to Firebase:', campaignId);
            return campaignId;

        } catch (error) {
            console.error('❌ Error saving campaign:', error);
            throw error;
        }
    }

    /**
     * Update campaign status
     */
    async updateCampaign(campaignId, updates) {
        if (!this.firebaseDb) return;

        try {
            await this.firebaseDb.collection('campaigns').doc(campaignId).update({
                ...updates,
                updatedAt: firebase.firestore.Timestamp.now()
            });

            console.log('✅ Campaign updated:', campaignId);
            this.loadCampaigns(); // Refresh list

        } catch (error) {
            console.error('❌ Error updating campaign:', error);
        }
    }

    /**
     * Load campaigns from Firebase
     */
    async loadCampaigns() {
        if (!this.firebaseDb || !this.currentUser || !this.campaignsListElement) {
            return;
        }

        try {
            const snapshot = await this.firebaseDb.collection('campaigns')
                .where('userId', '==', this.currentUser.uid)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();

            if (snapshot.empty) {
                this.showEmptyState();
                return;
            }

            this.renderCampaigns(snapshot.docs);

        } catch (error) {
            console.error('❌ Error loading campaigns:', error);
            this.showEmptyState();
        }
    }

    /**
     * Render campaigns list
     */
    renderCampaigns(docs) {
        const campaigns = docs.map(doc => ({ id: doc.id, ...doc.data() }));

        this.campaignsListElement.innerHTML = campaigns.map(campaign => `
            <div class="campaign-card" data-campaign-id="${campaign.campaignId}">
                <div class="campaign-header">
                    <div class="campaign-info">
                        <h3 class="campaign-name">${this.escapeHtml(campaign.campaignName)}</h3>
                        <p class="campaign-date">${this.formatDate(campaign.createdAt)}</p>
                    </div>
                    <div class="campaign-status">
                        ${campaign.status === 'completed' ? '✅ Completed' :
                            campaign.status === 'generating' ? '<span class="status-badge status-generating">⚙️ Generating</span>' :
                            campaign.status === 'drafts_ready' ? '<span class="status-badge status-drafts_ready">📝 Drafts Ready</span>' :
                            `<span class="status-badge status-${campaign.status || 'processing'}">${campaign.status === 'processing' ? '🔄 Processing' : campaign.status === 'failed' ? '❌ Failed' : '⏸️ Paused'}</span>`}
                    </div>
                </div>

                <div class="campaign-stats">
                    <div class="stat-item">
                        <i data-lucide="users"></i>
                        <div>
                            <span class="stat-value">${campaign.emailsTotal || 0}</span>
                            <span class="stat-label">Contacts</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="send"></i>
                        <div>
                            <span class="stat-value">${campaign.emailsSent || 0}</span>
                            <span class="stat-label">Sent</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="check-circle"></i>
                        <div>
                            <span class="stat-value">${campaign.successCount || 0}</span>
                            <span class="stat-label">Success</span>
                        </div>
                    </div>
                    <div class="stat-item">
                        <i data-lucide="x-circle"></i>
                        <div>
                            <span class="stat-value">${campaign.failureCount || 0}</span>
                            <span class="stat-label">Failed</span>
                        </div>
                    </div>
                </div>

                <div class="campaign-actions">
                    <button class="btn btn-sm btn-secondary view-details-btn"
                            onclick="campaignManager.viewDetails('${campaign.campaignId}')">
                        <i data-lucide="eye"></i>
                        View Details
                    </button>
                </div>
            </div>
        `).join('');

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Show empty state
     */
    showEmptyState() {
        this.campaignsListElement.innerHTML = `
            <div class="empty-state">
                <i data-lucide="send"></i>
                <p>No campaigns yet</p>
                <span>Create your first campaign to start reaching out</span>
            </div>
        `;

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * View campaign details
     */
    async viewDetails(campaignId) {
        if (!this.firebaseDb) return;

        try {
            const doc = await this.firebaseDb.collection('campaigns').doc(campaignId).get();

            if (!doc.exists) {
                alert('Campaign not found');
                return;
            }

            const campaign = doc.data();
            this.showDetailsModal(campaign);

        } catch (error) {
            console.error('Error loading campaign details:', error);
            alert('Failed to load campaign details');
        }
    }

    /**
     * Show details modal
     */
    showDetailsModal(campaign) {
        const contacts = campaign.contacts || [];
        const csvPreview = campaign.csvData ?
            campaign.csvData.split('\n').slice(0, 6).join('\n') :
            'No CSV data';

        const modalHtml = `
            <div class="campaign-modal-overlay show" id="campaignDetailsModal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>📊 Campaign Details</h2>
                        <button class="modal-close" onclick="this.closest('.campaign-modal-overlay').remove()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="detail-section">
                            <h3>📋 Basic Information</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Campaign Name:</strong>
                                    <span>${this.escapeHtml(campaign.campaignName)}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Campaign ID:</strong>
                                    <code>${campaign.campaignId}</code>
                                </div>
                                <div class="detail-item">
                                    <strong>Status:</strong>
                                    ${campaign.status === 'completed' ? this.getStatusText(campaign.status) : `<span class="status-badge status-${campaign.status}">${this.getStatusText(campaign.status)}</span>`}
                                </div>
                                <div class="detail-item">
                                    <strong>Created:</strong>
                                    <span>${this.formatDate(campaign.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>📧 Email Statistics</h3>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <i data-lucide="users"></i>
                                    <div>
                                        <span class="stat-number">${campaign.emailsTotal || 0}</span>
                                        <span class="stat-label">Total Contacts</span>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <i data-lucide="send"></i>
                                    <div>
                                        <span class="stat-number">${campaign.emailsSent || 0}</span>
                                        <span class="stat-label">Emails Sent</span>
                                    </div>
                                </div>
                                <div class="stat-card stat-success">
                                    <i data-lucide="check-circle"></i>
                                    <div>
                                        <span class="stat-number">${campaign.successCount || 0}</span>
                                        <span class="stat-label">Successful</span>
                                    </div>
                                </div>
                                <div class="stat-card stat-error">
                                    <i data-lucide="x-circle"></i>
                                    <div>
                                        <span class="stat-number">${campaign.failureCount || 0}</span>
                                        <span class="stat-label">Failed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>👥 Contact List (${contacts.length} contacts)</h3>
                            <div class="contacts-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Company</th>
                                            <th>Position</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${contacts.slice(0, 10).map(contact => `
                                            <tr>
                                                <td>${this.escapeHtml(contact.name || '-')}</td>
                                                <td>${this.escapeHtml(contact.email || '-')}</td>
                                                <td>${this.escapeHtml(contact.company || '-')}</td>
                                                <td>${this.escapeHtml(contact.position || '-')}</td>
                                            </tr>
                                        `).join('')}
                                        ${contacts.length > 10 ? `
                                            <tr>
                                                <td colspan="4" style="text-align: center; color: #666;">
                                                    ... and ${contacts.length - 10} more contacts
                                                </td>
                                            </tr>
                                        ` : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>📄 CSV Preview</h3>
                            <pre class="csv-preview">${this.escapeHtml(csvPreview)}</pre>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-primary" id="checkRepliesBtn" data-campaign-id="${campaign.campaignId}">
                            <i data-lucide="inbox"></i>
                            Control / Check Replies
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.campaign-modal-overlay').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('checkRepliesBtn').addEventListener('click', (e) => {
            const campaignId = e.currentTarget.getAttribute('data-campaign-id');
            this.checkReplies(campaignId);
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Check for replies
     */
    async checkReplies(campaignId) {
        if (!this.firebaseDb) return;

        try {
            const doc = await this.firebaseDb.collection('campaigns').doc(campaignId).get();

            if (!doc.exists) {
                alert('Campaign not found');
                return;
            }

            const campaign = doc.data();
            const leadEmails = campaign.contacts.map(c => c.email);
            const campaignStartDate = campaign.createdAt.toDate().toISOString();

            const payload = {
                campaignId: campaign.campaignId,
                leadEmails: leadEmails,
                campaignStartDate: campaignStartDate
            };

            const response = await fetch(window.CONFIG.webhooks.checkReplies, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed with status ${response.status}`);
            }

            const result = await response.json();

            // Close the Campaign Details modal
            const existingModal = document.getElementById('campaignDetailsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Show the Check Replies results modal
            this.showCheckRepliesModal(result, campaign);

        } catch (error) {
            console.error('Error checking replies:', error);
            alert('Failed to check for replies.');
        }
    }

    /**
     * Show Check Replies Results Modal
     */
    showCheckRepliesModal(result, campaign) {
        const repliedLeads = result.repliedLeads || [];
        const unrepliedLeads = result.unrepliedLeads || [];
        const totalChecked = result.totalLeadsChecked || 0;

        const modalHtml = `
            <div class="campaign-modal-overlay show" id="checkRepliesModal">
                <div class="modal-content modal-large">
                    <div class="modal-header">
                        <h2>📊 Reply Check Results</h2>
                        <button class="modal-close" onclick="this.closest('.campaign-modal-overlay').remove()">
                            <i data-lucide="x"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        <div class="detail-section">
                            <h3>📋 Campaign Information</h3>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Campaign Name:</strong>
                                    <span>${this.escapeHtml(campaign.campaignName)}</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Campaign ID:</strong>
                                    <code>${campaign.campaignId}</code>
                                </div>
                                <div class="detail-item">
                                    <strong>Check Time:</strong>
                                    <span>${new Date(result.checkTimestamp).toLocaleString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>📧 Reply Statistics</h3>
                            <div class="stats-grid">
                                <div class="stat-card">
                                    <i data-lucide="users"></i>
                                    <div>
                                        <span class="stat-number">${totalChecked}</span>
                                        <span class="stat-label">Total Checked</span>
                                    </div>
                                </div>
                                <div class="stat-card stat-success">
                                    <i data-lucide="check-circle"></i>
                                    <div>
                                        <span class="stat-number">${repliedLeads.length}</span>
                                        <span class="stat-label">Replied</span>
                                    </div>
                                </div>
                                <div class="stat-card stat-error">
                                    <i data-lucide="mail"></i>
                                    <div>
                                        <span class="stat-number">${unrepliedLeads.length}</span>
                                        <span class="stat-label">No Reply</span>
                                    </div>
                                </div>
                                <div class="stat-card">
                                    <i data-lucide="percent"></i>
                                    <div>
                                        <span class="stat-number">${totalChecked > 0 ? Math.round((repliedLeads.length / totalChecked) * 100) : 0}%</span>
                                        <span class="stat-label">Reply Rate</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        ${repliedLeads.length > 0 ? `
                        <div class="detail-section">
                            <h3>✅ Leads Who Replied (${repliedLeads.length})</h3>
                            <div class="contacts-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${repliedLeads.map(email => `
                                            <tr>
                                                <td>${this.escapeHtml(email)}</td>
                                                <td><span class="status-badge status-completed">Replied</span></td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ` : ''}

                        ${unrepliedLeads.length > 0 ? `
                        <div class="detail-section">
                            <h3>⏳ Leads Without Reply (${unrepliedLeads.length})</h3>
                            <div class="contacts-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${unrepliedLeads.slice(0, 10).map(email => `
                                            <tr>
                                                <td>${this.escapeHtml(email)}</td>
                                                <td><span class="status-badge status-pending">No Reply</span></td>
                                            </tr>
                                        `).join('')}
                                        ${unrepliedLeads.length > 10 ? `
                                            <tr>
                                                <td colspan="2" style="text-align: center; color: #666;">
                                                    ... and ${unrepliedLeads.length - 10} more leads
                                                </td>
                                            </tr>
                                        ` : ''}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ` : ''}

                        ${result.note ? `
                        <div class="detail-section">
                            <div class="alert alert-info">
                                <i data-lucide="info"></i>
                                <span>${this.escapeHtml(result.note)}</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="this.closest('.campaign-modal-overlay').remove()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Helper: Format date (TR timezone)
     */
    formatDate(timestamp) {
        if (!timestamp) return '-';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Istanbul'
        }).format(date);
    }

    /**
     * Helper: Get status text
     */
    getStatusText(status) {
        const statusMap = {
            'processing': '🔄 Processing',
            'completed': '✅ Completed',
            'failed': '❌ Failed',
            'paused': '⏸️ Paused',
            'generating': '⚙️ Generating',
            'drafts_ready': '📝 Drafts Ready'
        };
        return statusMap[status] || status;
    }

    /**
     * Helper: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global instance
const campaignManager = new CampaignManager();
