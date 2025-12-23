/**
 * Unsubscribe Logic
 * Handles email unsubscription and saves to Firestore
 */

// Wait for DOM and Firebase to be ready
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('unsubscribeForm');
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Check if Firebase is initialized
    if (!window.firebaseDb) {
        console.error('❌ Firebase not initialized');
        showError('System error. Please try again later.');
        return;
    }

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim().toLowerCase();

        // Validate email
        if (!OutreachUtils.validation.isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        // Disable form
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Unsubscribing...';
        hideMessages();

        try {
            // Save to Firestore with auto-generated ID
            // No duplicate check needed - if someone unsubscribes twice, that's fine
            const unsubscribedRef = window.firebaseDb.collection('unsubscribed_emails');

            await unsubscribedRef.add({
                email: email,
                unsubscribedAt: firebase.firestore.Timestamp.now(),
                source: 'manual',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ipAddress: 'N/A' // You'd need a backend service for real IP
            });

            console.log('✅ Email unsubscribed:', email);

            // Show success message
            showSuccess('Successfully unsubscribed! You won\'t receive any more emails from us.');

            // Clear form
            emailInput.value = '';

            // Track analytics (optional)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'unsubscribe', {
                    event_category: 'engagement',
                    event_label: email
                });
            }

        } catch (error) {
            console.error('❌ Unsubscribe error:', error);
            showError('Failed to unsubscribe. Please try again or contact support.');
        } finally {
            // Re-enable form
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Unsubscribe';
        }
    });

    /**
     * Show success message
     */
    function showSuccess(message) {
        hideMessages();
        successMessage.querySelector('span').textContent = message;
        successMessage.classList.add('show');

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        hideMessages();
        errorText.textContent = message;
        errorMessage.classList.add('show');

        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Hide all messages
     */
    function hideMessages() {
        successMessage.classList.remove('show');
        errorMessage.classList.remove('show');
    }

    /**
     * Auto-fill email from URL parameter (optional)
     * Example: unsubscribe.html?email=john@example.com
     */
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmail = urlParams.get('email');
    if (urlEmail && OutreachUtils.validation.isValidEmail(urlEmail)) {
        emailInput.value = urlEmail.toLowerCase();
    }
});
