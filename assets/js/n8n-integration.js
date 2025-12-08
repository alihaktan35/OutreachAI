/**
 * n8n Integration for OutreachAI
 * Handles webhook communication with n8n automation service
 */

// n8n Configuration
const N8N_CONFIG = {
    webhookUrl: 'http://localhost:5678/webhook/simple-email-campaign',
    healthCheckInterval: 30000, // Check every 30 seconds
    timeout: 60000 // 60 seconds timeout
};

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
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(N8N_CONFIG.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ping: true }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            // n8n webhook yanıt veriyorsa (hata da olsa), aktiftir
            this.setStatus(true);
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
        }, N8N_CONFIG.healthCheckInterval);
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}

// CSV File Handler
class CSVHandler {
    static async readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    static parseCSV(csvText) {
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
}

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

    async launchCampaign(formData) {
        if (!this.statusManager.isOnline) {
            this.showToast('❌ n8n is offline. Please start n8n and activate the workflow.', 'error');
            return;
        }

        // Form validasyonu
        const csvFile = this.csvFileInput.files[0];
        if (!csvFile) {
            this.showToast('❌ Please upload a CSV file', 'error');
            return;
        }

        try {
            // Button loading state
            this.launchButton.classList.add('btn-loading');
            this.launchButton.disabled = true;
            this.launchButton.innerHTML = '<i data-lucide="loader"></i> Launching Campaign...';

            // CSV'yi oku ve parse et
            const csvText = await CSVHandler.readFile(csvFile);
            const validatedCSV = CSVHandler.parseCSV(csvText);

            // CSV'den contact listesi çıkar
            const contacts = this.parseContacts(validatedCSV);

            // Campaign data hazırla
            const campaignData = {
                csvData: validatedCSV,
                contacts: contacts,
                campaignInfo: {
                    campaignName: formData.get('campaignName'),
                    timestamp: new Date().toISOString()
                }
            };

            // Firebase'e kaydet (opsiyonel)
            let campaignId = null;
            if (typeof campaignManager !== 'undefined' &&
                campaignManager.db &&
                campaignManager.currentUser) {
                try {
                    campaignId = await campaignManager.saveCampaign({
                        campaignName: formData.get('campaignName'),
                        csvData: validatedCSV,
                        contacts: contacts
                    });
                    console.log('✅ Campaign saved to Firebase:', campaignId);
                } catch (error) {
                    console.warn('⚠️ Firebase save failed (continuing anyway):', error.message);
                    // Continue with n8n even if Firebase fails
                }
            } else {
                console.log('ℹ️ Skipping Firebase save (not initialized or user not logged in)');
            }

            // n8n webhook'a gönder
            const response = await fetch(N8N_CONFIG.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(campaignData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            let result;
            try {
                result = await response.json();
            } catch (e) {
                // JSON parse hatası - ama istek başarılı
                result = { status: 'success' };
            }

            // Başarılı
            const emailCount = result.totalEmails || 'Campaign processing';
            this.showToast(`✅ Campaign launched successfully! ${emailCount}`, 'success');

            console.log('Campaign result:', result);

            // Formu temizle
            this.campaignForm.reset();
            this.csvFileInput.value = '';

            // CSV preview'u gizle
            const csvPreview = document.getElementById('csvPreview');
            if (csvPreview) csvPreview.style.display = 'none';

            const fileUploadText = document.getElementById('fileUploadText');
            if (fileUploadText) fileUploadText.textContent = 'Click to upload or drag and drop';

            // Campaign form'u gizle
            document.getElementById('campaignFormContainer').style.display = 'none';

            // Campaign listesini yenile (eğer Firebase'e kaydedildiyse)
            if (campaignId && typeof campaignManager !== 'undefined' && campaignManager.loadCampaigns) {
                setTimeout(() => {
                    campaignManager.loadCampaigns();
                }, 1000);
            }

            // Başarı mesajı göster
            setTimeout(() => {
                const dbMessage = campaignId
                    ? '\n\n💾 Campaign saved to database.'
                    : '\n\nℹ️ Campaign not saved (login to save campaigns).';
                alert('✅ Campaign launched successfully!\n\n📧 Emails are being sent via Gmail SMTP.\n🔍 Check n8n Executions for real-time progress.' + dbMessage);
            }, 500);

        } catch (error) {
            console.error('Campaign launch error:', error);
            this.showToast(`❌ Failed to launch campaign: ${error.message}`, 'error');
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

    // Form submit handler
    const campaignForm = document.getElementById('campaignForm');
    if (campaignForm) {
        campaignForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(campaignForm);
            await launcher.launchCampaign(formData);
        });
    }

    // CSV file change handler - show file name
    const csvFileInput = document.getElementById('csvFile');
    const csvPreview = document.getElementById('csvPreview');
    const csvFileName = document.getElementById('csvFileName');
    const fileUploadText = document.getElementById('fileUploadText');

    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (csvFileName) csvFileName.textContent = `File selected: ${file.name}`;
                if (csvPreview) csvPreview.style.display = 'block';
                if (fileUploadText) fileUploadText.textContent = file.name;

                // Re-init icons
                lucide.createIcons();
            }
        });
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        statusManager.stopMonitoring();
    });
});
