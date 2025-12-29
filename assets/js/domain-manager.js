/**
 * OutreachAI - Domain Manager
 * Handles domain suggestions and availability checks
 */

// Ali Haktan'ın istediği ✅/❌ mantığı ve 5-6 alternatif üretimi
const DomainManager = {
    // 5-6 tane alternatif belirleme
    generateSuggestions(mainDomain) {
        if (!mainDomain) return [];
        const name = mainDomain.split('.')[0];
        const tld = mainDomain.split('.')[1] || 'com';

        return [
            `get${name}.${tld}`,
            `try${name}.${tld}`,
            `${name}mail.${tld}`,
            `${name}app.${tld}`,
            `${name}hq.${tld}`,
            `use${name}.${tld}`
        ];
    },

    // Boşta mı kontrolü (Şimdilik mock, sonra API bağlanacak)
    async checkAvailability(domain) {
        // Simülasyon: Rastgele doğru/yanlış döndürür
        await new Promise(resolve => setTimeout(resolve, 500)); // Gecikme hissi
        return Math.random() > 0.4; 
    },

    // Arayüzü Ali'nin istediği ikonlarla basma
    async render(domains) {
        const outputDiv = document.getElementById('suggestedDomainsOutput');
        if (!outputDiv) return;

        outputDiv.innerHTML = '<p style="grid-column: 1/-1;">Checking domains...</p>';

        let html = '';
        for (const domain of domains) {
            const isAvailable = await this.checkAvailability(domain);
            const icon = isAvailable ? '✅' : '❌'; // İstenen ikonlar
            
            html += `
                <div class="domains-list-card">
                    <span>${icon} ${domain}</span>
                    <button class="btn btn-sm btn-primary copy-domain-btn" data-domain="${domain}">
                        <i data-lucide="copy"></i> Copy
                    </button>
                </div>
            `;
        }
        outputDiv.innerHTML = html;
        lucide.createIcons();
    }
};

// Event Listener'ı buraya taşıyarak dashboard.js'i hafifletiyoruz
document.getElementById('suggestDomainsBtn')?.addEventListener('click', async () => {
    const mainDomain = document.getElementById('mainDomainInput').value.trim();
    if (!mainDomain) {
        OutreachUtils.toast.show('Please enter a domain', 'warning');
        return;
    }
    const suggestions = DomainManager.generateSuggestions(mainDomain);
    await DomainManager.render(suggestions);
});