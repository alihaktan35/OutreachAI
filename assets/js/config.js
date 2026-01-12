/**
 * OutreachAI Configuration
 *
 * This file contains all configuration settings for the application.
 * For production, these should be loaded from environment variables.
 */

const CONFIG = {
    // n8n Webhook Configuration
    // IMPORTANT: Replace these with your actual n8n webhook URLs from AWS
    // Example: 'http://YOUR_AWS_IP:5678/webhook/launch-campaign'
    webhooks: {
        // Webhook for n8n health check
        ping: 'http://16.171.174.159:5678/webhook/ping',
        // Webhook for creating email drafts
        createDraft: 'http://16.171.174.159:5678/webhook/create-draft',
        // Webhook for sending final emails
        sendMail: 'http://16.171.174.159:5678/webhook/send-mail',
        // Webhook for checking replies
        checkReplies: 'http://16.171.174.159:5678/webhook/check-replies',
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



// Export configuration
window.CONFIG = CONFIG;
