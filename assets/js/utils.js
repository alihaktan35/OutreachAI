/**
 * OutreachAI Shared Utilities Module
 * Consolidates common functions used across multiple pages
 */

const OutreachUtils = {
    /**
     * Dark Mode Management
     */
    darkMode: {
        /**
         * Initialize dark mode from localStorage
         */
        init: function() {
            const savedTheme = localStorage.getItem('theme');
            const themePreference = document.getElementById('themePreference');
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            // Apply saved theme or default to auto
            const theme = savedTheme || (prefersDark ? 'dark' : 'light');

            if (themePreference) {
                themePreference.value = savedTheme || 'auto';
            }

            this.applyTheme(savedTheme || 'auto');
            this.updateIcon();
        },

        /**
         * Apply theme (auto, light, or dark)
         */
        applyTheme: function(theme) {
            if (theme === 'auto') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }
        },

        /**
         * Update theme icon (moon/sun)
         */
        updateIcon: function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const themeIcon = document.getElementById('themeIcon');
            if (themeIcon) {
                themeIcon.setAttribute('data-lucide', currentTheme === 'dark' ? 'sun' : 'moon');
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }
            }
        },

        /**
         * Toggle between light and dark modes
         */
        toggle: function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update dropdown if exists
            const themePreference = document.getElementById('themePreference');
            if (themePreference) {
                themePreference.value = newTheme;
            }

            this.updateIcon();
            OutreachUtils.toast.show(`Switched to ${newTheme} mode`, 'success');
        }
    },

    /**
     * Toast Notifications
     */
    toast: {
        timeoutId: null,

        /**
         * Show toast notification
         * @param {string} message - The message to display
         * @param {string} type - Type of toast (success, error, warning, info)
         */
        show: function(message, type = 'success') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');

            if (!toast || !toastMessage) return;

            // Clear any existing timeout
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }

            // First, ensure toast is hidden
            toast.classList.remove('show');

            // Small delay to ensure the hide animation completes
            setTimeout(() => {
                toastMessage.textContent = message;

                // Change icon based on type
                const icon = toast.querySelector('i');
                if (icon) {
                    const iconMap = {
                        'success': 'check-circle',
                        'error': 'x-circle',
                        'warning': 'alert-circle',
                        'info': 'info'
                    };
                    icon.setAttribute('data-lucide', iconMap[type] || 'check-circle');
                }

                // Recreate icons
                if (typeof lucide !== 'undefined') {
                    lucide.createIcons();
                }

                // Show toast
                toast.classList.add('show');

                // Auto-hide after duration
                const duration = (window.CONFIG && window.CONFIG.ui && window.CONFIG.ui.toastDuration) || 3000;
                this.timeoutId = setTimeout(() => {
                    toast.classList.remove('show');
                    this.timeoutId = null;
                }, duration);
            }, 50);
        }
    },

    /**
     * Validation Utilities
     */
    validation: {
        /**
         * Validate email format
         * @param {string} email - Email address to validate
         * @returns {boolean} True if email is valid
         */
        isValidEmail: function(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    },

    /**
     * Campaign Utilities
     */
    campaign: {
        /**
         * Generate unique campaign ID
         * @returns {string} Campaign ID in format: camp_[timestamp]_[random]
         */
        generateId: function() {
            return 'camp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
    },

    /**
     * Lead Source Utilities
     */
    leadSource: {
        /**
         * Handle lead source change (show/hide CSV upload section)
         * @param {Event} event - Change event from lead source select
         */
        handleChange: function(event) {
            const csvSection = document.getElementById('csvUploadSection');
            if (csvSection) {
                if (event.target.value === 'csv') {
                    csvSection.style.display = 'block';
                } else {
                    csvSection.style.display = 'none';
                }
            }
        }
    },

    /**
     * Domain Utilities
     */
    domain: {
        /**
         * Check if a domain is available using Google DNS-over-HTTPS API
         * @param {string} domainName - Domain name to check (e.g., "example.com")
         * @returns {Promise<boolean>} True if domain is likely available (NXDOMAIN), false if taken
         */
        isDomainAvailable: async function(domainName) {
            try {
                // Remove protocol and www if present
                domainName = domainName.replace(/^https?:\/\//, '').replace(/^www\./, '').trim();
                
                // Basic validation
                if (!domainName || !/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(domainName)) {
                    throw new Error('Invalid domain format');
                }

                // Query Google DNS-over-HTTPS API
                const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domainName)}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`DNS query failed: ${response.status}`);
                }

                const data = await response.json();

                // Status 3 = NXDOMAIN (domain not found, likely available)
                // Status 0 = NOERROR (domain exists, taken)
                if (data.Status === 3) {
                    return true; // Domain is likely available
                } else if (data.Status === 0) {
                    return false; // Domain is taken
                } else {
                    // Other status codes - treat as error/unknown
                    throw new Error(`Unexpected DNS status: ${data.Status}`);
                }
            } catch (error) {
                console.error('Error checking domain availability:', error);
                throw error;
            }
        }
    }
};

// Export globally
window.OutreachUtils = OutreachUtils;
