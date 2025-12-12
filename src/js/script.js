
// Visible at: file:///c:/Users/elena/OneDrive/Documents/GitHub/sae-105-2025-public-Katherina5Charvoz/index.html
// Interaction: menu rétractable, carrousel, lightbox/modal

(function () {
    // --- Menu rétractable accessible ---
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    let lastFocused = null;

    function openMenu() {
        lastFocused = document.activeElement;
        mainNav.hidden = false;
        // allow next frame for CSS transition
        requestAnimationFrame(() => mainNav.classList.add('open'));
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
        // focus first link
        const firstLink = mainNav.querySelector('a');
        if (firstLink) firstLink.focus();
        // trap focus
        document.addEventListener('keydown', handleMenuKeydown);
    }

    function closeMenu() {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        document.removeEventListener('keydown', handleMenuKeydown);
        // after transition, hide
        mainNav.addEventListener('transitionend', function hide() {
            mainNav.hidden = true;
            mainNav.removeEventListener('transitionend', hide);
            if (lastFocused) lastFocused.focus();
        });
    }

    function toggleMenu() {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        if (expanded) closeMenu(); else openMenu();
    }

    function handleMenuKeydown(e) {
        if (e.key === 'Escape') {
            closeMenu();
            return;
        }
        if (e.key !== 'Tab') return;
        const focusable = Array.from(mainNav.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])'))
            .filter(n => !n.hasAttribute('disabled'));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // --- Carrousel simple ---
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        const track = carousel.querySelector('.carousel-track');
        const slides = Array.from(carousel.querySelectorAll('.slide'));
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        let index = 0;

        function updateCarousel() {
            const offset = -index * 100;
            track.style.transform = `translateX(${offset}%)`;
            slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== index));
        }

        function prev() { index = (index - 1 + slides.length) % slides.length; updateCarousel(); }
        function next() { index = (index + 1) % slides.length; updateCarousel(); }

        prevBtn.addEventListener('click', prev);
        nextBtn.addEventListener('click', next);
        // keyboard support
        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });
        // initialize
        updateCarousel();
    }

    // --- Lightbox / modal (contrôle du scroll + accessibilité) ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const zoomables = Array.from(document.querySelectorAll('img.zoomable'));

    function openLightbox(src, alt) {
        if (!lightbox) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.hidden = false;
        document.body.classList.add('no-scroll');
        lightboxClose.focus();
        document.addEventListener('keydown', handleLightboxKeydown);
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.hidden = true;
        document.body.classList.remove('no-scroll');
        lightboxImg.src = '';
        document.removeEventListener('keydown', handleLightboxKeydown);
    }

    function handleLightboxKeydown(e) {
        if (e.key === 'Escape') closeLightbox();
    }

    zoomables.forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => openLightbox(img.src, img.alt));
        img.addEventListener('keydown', (e) => { if (e.key === 'Enter') openLightbox(img.src, img.alt); });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

    // Small enhancement: close menu when a nav link is clicked (for single page nav)
    mainNav && mainNav.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') closeMenu();
    });

})();

