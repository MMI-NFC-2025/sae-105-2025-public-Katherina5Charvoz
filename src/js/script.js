
// Visible at: file:///c:/Users/elena/OneDrive/Documents/GitHub/sae-105-2025-public-Katherina5Charvoz/index.html
// Interaction: menu rétractable, carrousel, lightbox/modal

(function () {
    // --- Menu rétractable accessible ---
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const pageMain = document.getElementById('pageMain');
    const menuOverlay = document.getElementById('menuOverlay');
    const menuClose = document.getElementById('menuClose');
    let lastFocused = null;
    let docClickHandler = null;

    function openMenu() {
        lastFocused = document.activeElement;
        mainNav.hidden = false;
        // allow next frame for CSS transition
        requestAnimationFrame(() => mainNav.classList.add('open'));
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
        if (pageMain) pageMain.setAttribute('aria-hidden', 'true');
        if (menuOverlay) { menuOverlay.hidden = false; requestAnimationFrame(() => menuOverlay.classList.add('visible')); }
        // focus first link
        const firstLink = mainNav.querySelector('a');
        if (firstLink) firstLink.focus();
        // trap focus
        document.addEventListener('keydown', handleMenuKeydown);
        // close when clicking outside
        docClickHandler = function (ev) {
            if (!mainNav.contains(ev.target) && ev.target !== menuToggle && !menuToggle.contains(ev.target)) {
                closeMenu();
            }
        };
        document.addEventListener('mousedown', docClickHandler);
    }

    function closeMenu() {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
        if (pageMain) pageMain.removeAttribute('aria-hidden');
        document.removeEventListener('keydown', handleMenuKeydown);
        if (docClickHandler) { document.removeEventListener('mousedown', docClickHandler); docClickHandler = null; }
        if (menuOverlay) { menuOverlay.classList.remove('visible'); }
        // after transition, hide menu and restore focus
        mainNav.addEventListener('transitionend', function hide() {
            mainNav.hidden = true;
            mainNav.removeEventListener('transitionend', hide);
            if (lastFocused) lastFocused.focus();
        });
        // hide overlay after its transition
        if (menuOverlay) {
            const onEnd = function () { menuOverlay.hidden = true; menuOverlay.removeEventListener('transitionend', onEnd); };
            menuOverlay.addEventListener('transitionend', onEnd);
        }
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
    if (menuClose) menuClose.addEventListener('click', closeMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);

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

    // --- Scenes carousel (animated, autoplay, accessible) ---
    (function initScenesCarousel() {
        const carousel = document.getElementById('scenesCarousel');
        if (!carousel) return;
        const track = carousel.querySelector('.scenes-track');
        const slides = Array.from(carousel.querySelectorAll('.scenes-slide'));
        const prev = carousel.querySelector('.scenes-prev');
        const next = carousel.querySelector('.scenes-next');
        const dotsWrap = carousel.querySelector('.scenes-dots');
        let current = 0;
        const interval = 5000;
        let timer = null;

        function goTo(i, user) {
            current = (i + slides.length) % slides.length;
            const offset = -current * 100;
            track.style.transform = `translateX(${offset}%)`;
            slides.forEach((s, idx) => s.setAttribute('aria-hidden', idx !== current));
            // update dots
            const dots = Array.from(dotsWrap.querySelectorAll('button'));
            dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
            if (!user) return;
            // when user interacts, pause autoplay briefly
            pauseAutoplay();
            startAutoplay(3000);
        }

        function prevSlide() { goTo(current - 1, true); }
        function nextSlide() { goTo(current + 1, true); }

        // create dots
        slides.forEach((s, idx) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', `Aller à la diapositive ${idx + 1}`);
            b.addEventListener('click', () => goTo(idx, true));
            if (idx === 0) b.classList.add('active');
            dotsWrap.appendChild(b);
        });

        prev.addEventListener('click', prevSlide);
        next.addEventListener('click', nextSlide);

        carousel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') prevSlide();
            if (e.key === 'ArrowRight') nextSlide();
        });

        function startAutoplay(wait) {
            if (timer) clearInterval(timer);
            timer = setInterval(() => { goTo(current + 1, false); }, wait || interval);
        }

        function pauseAutoplay() { if (timer) { clearInterval(timer); timer = null; } }

        carousel.addEventListener('mouseenter', pauseAutoplay);
        carousel.addEventListener('focusin', pauseAutoplay);
        carousel.addEventListener('mouseleave', () => startAutoplay());
        carousel.addEventListener('focusout', () => startAutoplay());

        // initialize
        goTo(0, false);
        startAutoplay();
    })();

})();

