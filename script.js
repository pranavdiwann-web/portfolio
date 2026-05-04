document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════════
       1. CUSTOM CURSOR GLOW
       ═══════════════════════════════════════════════ */
    const cursorGlow = document.getElementById('cursor-glow');
    let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
        cursorGlow.classList.add('visible');
    });

    // Smooth trailing via RAF
    function animateCursor() {
        glowX += (cursorX - glowX) * 0.15;
        glowY += (cursorY - glowY) * 0.15;
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Expand on hover over interactive elements
    const hoverTargets = 'a, button, .bento-item, .social-card, .pack-card, .vid-cell, .toc-entry, .portrait-container';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => cursorGlow.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorGlow.classList.remove('hover'));
    });

    /* ═══════════════════════════════════════════════
       2. SCROLL REVEAL (Intersection Observer)
       ═══════════════════════════════════════════════ */
    const revealSelectors = '.reveal-up, .reveal-left, .reveal-right, .reveal-blur, .stagger-fade';
    const revealEls = document.querySelectorAll(revealSelectors);

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach((el, i) => {
        if (el.classList.contains('stagger-fade')) {
            const siblings = el.parentElement.querySelectorAll('.stagger-fade');
            const idx = Array.from(siblings).indexOf(el);
            el.style.transitionDelay = `${idx * 0.1}s`;
        }
        revealObserver.observe(el);
    });

    /* ═══════════════════════════════════════════════
       3. SKILL BAR ANIMATION
       ═══════════════════════════════════════════════ */
    const skillBars = document.querySelectorAll('.skill-bar');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('animated'), 200);
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });
    skillBars.forEach(bar => skillObserver.observe(bar));

    /* ═══════════════════════════════════════════════
       4. WORK TOGGLE (Graphic / Video)
       ═══════════════════════════════════════════════ */
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const panels = document.querySelectorAll('.work-panel');
    const pill = document.querySelector('.toggle-pill');

    function positionPill(btn) {
        if (!pill || !btn) return;
        const bRect = btn.getBoundingClientRect();
        const pRect = btn.parentElement.getBoundingClientRect();
        pill.style.width = bRect.width + 'px';
        pill.style.transform = `translateX(${bRect.left - pRect.left - 6.4}px)`;
    }

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            positionPill(btn);

            const targetId = btn.dataset.target;
            panels.forEach(p => {
                p.classList.toggle('active', p.id === targetId);
            });

            // Re-trigger reveals in newly visible panel
            setTimeout(() => {
                const panel = document.getElementById(targetId);
                if (!panel) return;
                panel.querySelectorAll(revealSelectors).forEach(el => {
                    el.classList.remove('visible');
                    setTimeout(() => el.classList.add('visible'), 50);
                });
            }, 60);
        });
    });

    // Init pill position
    if (toggleBtns.length > 0) positionPill(toggleBtns[0]);
    window.addEventListener('resize', () => {
        const active = document.querySelector('.toggle-btn.active');
        if (active) positionPill(active);
    });

    /* ═══════════════════════════════════════════════
       5. SMOOTH SCROLL BUTTONS
       ═══════════════════════════════════════════════ */
    document.querySelectorAll('[data-scroll-to]').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = document.querySelector(btn.dataset.scrollTo);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    /* ═══════════════════════════════════════════════
       6. HERO ENTRANCE ANIMATION
       ═══════════════════════════════════════════════ */
    setTimeout(() => {
        document.querySelectorAll('#hero .reveal-up').forEach(el => el.classList.add('visible'));
        const heroBtns = document.querySelectorAll('.hero-buttons .btn');
        heroBtns.forEach((btn, idx) => {
            btn.style.opacity = '0';
            btn.style.transform = 'translateY(20px)';
            btn.style.transition = `opacity 0.6s var(--ease), transform 0.6s var(--ease)`;
            btn.style.transitionDelay = `${0.5 + idx * 0.12}s`;
            setTimeout(() => {
                btn.style.opacity = '1';
                btn.style.transform = 'translateY(0)';
                setTimeout(() => { btn.style.transitionDelay = '0s'; }, 1000);
            }, 50);
        });
    }, 100);

    /* ═══════════════════════════════════════════════
       7. SUBTLE PARALLAX / DEPTH
       ═══════════════════════════════════════════════ */
    const heroContent = document.querySelector('.hero-content');
    const parallaxEls = document.querySelectorAll('[data-parallax]');

    // Hero mouse parallax
    document.addEventListener('mousemove', (e) => {
        const cx = (e.clientX - window.innerWidth / 2) * 0.015;
        const cy = (e.clientY - window.innerHeight / 2) * 0.015;
        if (heroContent) {
            heroContent.style.transform = `translate(${cx}px, ${cy}px)`;
        }
    });

    // Scroll-based parallax for about section elements
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                parallaxEls.forEach(el => {
                    const speed = parseFloat(el.dataset.parallax);
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        const offset = (scrollY - el.offsetTop + window.innerHeight) * speed;
                        el.style.transform = `translateY(${offset}px)`;
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    });

    /* ═══════════════════════════════════════════════
       8. LIGHTBOX LOGIC
       ═══════════════════════════════════════════════ */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Find all zoomable images
    const zoomableImages = document.querySelectorAll('.bento-item img, .social-card img, .brand-block img, .brand-realworld-grid img, .pack-card img, .qr-img-file, .portrait-img');

    zoomableImages.forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightboxCaption.textContent = img.alt || 'Portfolio Work';
            lightbox.classList.add('visible');
            document.body.style.overflow = 'hidden'; // Prevent scroll
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('visible');
        document.body.style.overflow = ''; // Restore scroll
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
});

