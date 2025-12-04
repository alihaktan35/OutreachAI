/**
 * OutreachAI Configuration
 *
 * This file contains all configuration settings for the application.
 * For production, these should be loaded from environment variables.
 */

const CONFIG = {
    // n8n Webhook Configuration
    // Replace these with your actual n8n webhook URLs
    webhooks: {
        // Webhook for launching campaigns
        launchCampaign: 'https://your-n8n-instance.com/webhook/launch-campaign',

        // Webhook for checking campaign status
        checkStatus: 'https://your-n8n-instance.com/webhook/campaign-status',

        // Webhook for preview email generation
        previewEmail: 'https://your-n8n-instance.com/webhook/preview-email',
    },

    // API Configuration
    api: {
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
    },

    // Campaign Limits (based on subscription tier)
    limits: {
        starter: {
            maxContacts: 200,
            dailyEmails: 50,
        },
        professional: {
            maxContacts: 1000,
            dailyEmails: 200,
        },
        enterprise: {
            maxContacts: Infinity,
            dailyEmails: Infinity,
        }
    },

    // Default Campaign Settings
    defaults: {
        emailLimit: 50,
        followUpDelay: 3, // days
        spamCheckEnabled: true,
        crmSyncEnabled: true,
    },

    // Feature Flags
    features: {
        abTesting: true,
        csvUpload: true,
        apolloIntegration: true,
        linkedInIntegration: false, // Coming soon
    },

    // UI Configuration
    ui: {
        toastDuration: 3000, // milliseconds - auto-dismiss after 3 seconds
        statusPollInterval: 5000, // milliseconds
    }
};

// Development mode check
const isDevelopment = window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';

if (isDevelopment) {
    console.log('🔧 Running in development mode');
    console.log('📋 Configuration:', CONFIG);

    // Use mock endpoints in development
    CONFIG.webhooks = {
        launchCampaign: '/api/mock/launch-campaign',
        checkStatus: '/api/mock/campaign-status',
        previewEmail: '/api/mock/preview-email',
    };
}

// Export configuration
window.CONFIG = CONFIG;
