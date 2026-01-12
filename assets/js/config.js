/**
 * OutreachAI Configuration
 *
 * This file contains all configuration settings for the application.
 * For production, these should be loaded from environment variables.
 */

// Detect environment: Netlify (HTTPS) vs Localhost (HTTP)
const isNetlify = window.location.hostname.includes('netlify.app') || window.location.protocol === 'https:';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base URLs for webhooks
const WEBHOOK_BASE = isLocalhost
    ? 'http://16.171.174.159:5678/webhook'  // Direct n8n access for localhost
    : '/.netlify/functions';                // Netlify Functions proxy for production

const CONFIG = {
    // n8n Webhook Configuration
    // Automatically uses Netlify Functions on production, direct n8n on localhost
    webhooks: {
        // Webhook for n8n health check
        ping: isLocalhost
            ? 'http://16.171.174.159:5678/webhook/ping'
            : '/.netlify/functions/ping',
        // Webhook for creating email drafts
        createDraft: isLocalhost
            ? 'http://16.171.174.159:5678/webhook/create-draft'
            : '/.netlify/functions/create-draft',
        // Webhook for sending final emails
        sendMail: isLocalhost
            ? 'http://16.171.174.159:5678/webhook/send-mail'
            : '/.netlify/functions/send-mail',
        // Webhook for checking replies
        checkReplies: isLocalhost
            ? 'http://16.171.174.159:5678/webhook/check-replies'
            : '/.netlify/functions/check-replies',
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
