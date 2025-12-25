/**
 * n8n Integration for OutreachAI
 * Handles webhook communication with n8n automation service
 */

// n8n Status Manager
class N8NStatusManager {
    constructor() {
        this.isOnline = false;
        this.statusDot = document.getElementById('n8nStatusDot');
        this.statusText = document.getElementById('n8nStatusText');
        this.statusHelp = document.getElementById('n8nStatusHelp');
        this.checkInterval = null;
    }

    async checkStatus() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), CONFIG.api.timeout);

            const response = await fetch(CONFIG.webhooks.ping, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ping: true }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                // n8n webhook yanıt veriyorsa (hata da olsa), aktiftir
                this.setStatus(true);
            } else {
                this.setStatus(false);
            }
        } catch (error) {
            // Network hatası veya timeout = offline
            this.setStatus(false);
        }
    }

    setStatus(isOnline) {
        this.isOnline = isOnline;

        if (isOnline) {
            this.statusDot.className = 'status-dot status-online';
            this.statusText.textContent = 'n8n Services Active';
            this.statusHelp.textContent = '✓ Ready to process campaigns';
        } else {
            this.statusDot.className = 'status-dot status-offline';
            this.statusText.textContent = 'n8n Services Offline';
            this.statusHelp.textContent = '✗ Please start n8n and activate workflow';
        }
    }

    startMonitoring() {
        // İlk kontrolü hemen yap
        this.checkStatus();

        // Periyodik kontrol
        this.checkInterval = setInterval(() => {
            this.checkStatus();
        }, CONFIG.ui.statusPollInterval);
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// CSV File Handler
const CSVHandler = {
    async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    },

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredColumns = ['name', 'email'];

        const missingColumns = requiredColumns.filter(col =>
            !headers.some(h => h.toLowerCase() === col)
        );

        if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
        }

        return csvText;
    }
};

// Campaign Launcher
class CampaignLauncher {
    constructor(statusManager) {
        this.statusManager = statusManager;
        this.launchButton = document.getElementById('launchCampaignBtn');
        this.campaignForm = document.getElementById('campaignForm');
        this.csvFileInput = document.getElementById('csvFile');
    }

    parseContacts(csvText) {
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
    }

    async launchCampaign(campaignId, formData, csvData) {
        if (!this.statusManager.isOnline) {
            this.showToast('❌ n8n is offline. Please start n8n and activate the workflow.', 'error');
            return;
        }

        try {
            // Button loading state
            this.launchButton.classList.add('btn-loading');
            this.launchButton.disabled = true;
            this.launchButton.innerHTML = '<i data-lucide="loader"></i> Creating Drafts...';

            // Campaign data hazırla
            const campaignData = {
                campaignId: campaignId,
                csvData: csvData,
                campaignInfo: {
                    campaignName: formData.get('campaignName'),
                    timestamp: new Date().toISOString()
                },
                senderInfo: {
                    name: formData.get('senderName'),
                    title: formData.get('senderTitle'),
                    company: formData.get('senderCompany'),
                    email: formData.get('senderEmailAddress'),
                    phone: formData.get('senderPhone') || ''
                }
            };

            // n8n webhook'a gönder
            const response = await fetch(CONFIG.webhooks.createDraft, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campaignData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Başarılı
            this.showToast(`✅ Draft creation initiated for campaign ${campaignId}!`, 'success');

        } catch (error) {
            console.error('Draft creation error:', error);
            this.showToast(`❌ Failed to initiate draft creation: ${error.message}`, 'error');
        } finally {
            // Button'ı normal haline döndür
            this.launchButton.classList.remove('btn-loading');
            this.launchButton.disabled = false;
            this.launchButton.innerHTML = '<i data-lucide="send"></i> Launch Campaign';
            lucide.createIcons();
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');

        if (toast && toastMessage) {
            toastMessage.textContent = message;
            toast.className = `toast toast-${type} show`;

            setTimeout(() => {
                toast.classList.remove('show');
            }, 5000);
        } else {
            alert(message);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // n8n Status Manager başlat
    const statusManager = new N8NStatusManager();
    statusManager.startMonitoring();

    // Campaign Launcher başlat
    const launcher = new CampaignLauncher(statusManager);

    // CSV file change handler - show file name
    const csvFileInput = document.getElementById('csvFile');
    const csvPreview = document.getElementById('csvPreview');
    const csvFileName = document.getElementById('csvFileName');
    const fileUploadText = document.getElementById('fileUploadText');

    // Function to handle file selection (used by both click and drag & drop)
    function handleFileSelect(file) {
        if (file) {
            // Update file input
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            csvFileInput.files = dataTransfer.files;

            // Update UI
            if (csvFileName) csvFileName.textContent = `File selected: ${file.name}`;
            if (csvPreview) csvPreview.style.display = 'block';
            if (fileUploadText) fileUploadText.textContent = file.name;

            // Add persistent green state
            const fileUploadLabel = document.querySelector('.file-upload-label');
            if (fileUploadLabel) {
                fileUploadLabel.classList.add('file-uploaded');
            }

            // Re-init icons
            lucide.createIcons();
        }
    }

    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            handleFileSelect(file);
        });
    }

    // Drag & Drop functionality
    const fileUploadLabel = document.querySelector('.file-upload-label');

    if (fileUploadLabel && csvFileInput) {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            fileUploadLabel.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Highlight drop area when item is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadLabel.addEventListener(eventName, () => {
                fileUploadLabel.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadLabel.addEventListener(eventName, () => {
                fileUploadLabel.classList.remove('drag-over');
            });
        });

        // Handle dropped files
        fileUploadLabel.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;

            if (files.length > 0) {
                const file = files[0];

                // Check if it's a CSV file
                if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
                    handleFileSelect(file);
                    // file-uploaded class is now added in handleFileSelect (persistent)
                } else {
                    alert('❌ Please upload a CSV file');
                }
            }
        });
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        statusManager.stopMonitoring();
    });
});
