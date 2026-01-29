document.addEventListener('DOMContentLoaded', () => {
    // 1. Dynamic Settings Application
    async function applySettings() {
        try {
            const response = await fetch('/api/settings');
            const sett = await response.json();

            // Update email links
            if (sett.admin_email) {
                document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
                    a.href = `mailto:${sett.admin_email}`;
                    if (a.textContent.includes('@')) a.textContent = sett.admin_email;
                });
            }

            // Update WhatsApp links
            if (sett.admin_phone) {
                document.querySelectorAll('a[href*="wa.me"]').forEach(a => {
                    a.href = `https://wa.me/${sett.admin_phone}`;
                });
            }
        } catch (err) {
            console.error('Apply settings error:', err);
        }
    }

    applySettings();

    // 2. Scroll Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll('.showcase-card, .philosophy-text, .philosophy-image, .collection-card, .master-card, .detail-block, .reveal');

    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1), transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
});
