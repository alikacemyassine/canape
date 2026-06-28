/**
 * Shared site utilities: navigation, mobile menu, reveals and footer year.
 */
(function () {
    document.querySelectorAll('[data-year]').forEach((node) => {
        node.textContent = String(new Date().getFullYear());
    });

    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.35,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 0.6,
            smoothTouch: true,
            touchMultiplier: 1.5,
            infinite: false,
        });
        window.lenis = lenis;
    }

    if (lenis && typeof gsap !== 'undefined') {
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
    } else if (lenis) {
        const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    if (lenis && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
        ScrollTrigger.batch('.reveal-up', {
            onEnter: (elements) => {
                gsap.fromTo(elements,
                    { y: 36, autoAlpha: 0 },
                    { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: 'power2.out', overwrite: true }
                );
            },
            start: 'top 88%',
            once: true,
        });
    }

    const nav = document.getElementById('main-nav');
    const updateNav = (scroll = window.scrollY, velocity = 0) => {
        if (!nav) return;
        if (scroll > 50) {
            nav.classList.add('scrolled');
            if (velocity > 0 && scroll > 200) nav.classList.add('hidden-nav');
            else nav.classList.remove('hidden-nav');
        } else {
            nav.classList.remove('scrolled', 'hidden-nav');
        }
    };

    if (lenis) lenis.on('scroll', ({ scroll, velocity }) => updateNav(scroll, velocity));
    else window.addEventListener('scroll', () => updateNav(), { passive: true });
    updateNav();

    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuIcon = document.getElementById('mobile-menu-icon');
    let mobileMenuOpen = false;

    const setMobileMenu = (open) => {
        mobileMenuOpen = open;
        mobileMenu?.classList.toggle('translate-x-full', !open);
        mobileMenuToggle?.setAttribute('aria-expanded', String(open));
        if (mobileMenuIcon) mobileMenuIcon.textContent = open ? 'close' : 'menu';
        if (open) lenis?.stop();
        else lenis?.start();
    };

    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.addEventListener('click', () => setMobileMenu(!mobileMenuOpen));
        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMobileMenu(false));
        });
    }

    if (typeof gsap !== 'undefined') {
        document.querySelectorAll('.magnetic-link').forEach((link) => {
            link.addEventListener('mousemove', (event) => {
                const rect = link.getBoundingClientRect();
                const x = event.clientX - rect.left - rect.width / 2;
                const y = event.clientY - rect.top - rect.height / 2;
                gsap.to(link, { x: x * 0.2, y: y * 0.2, duration: 0.3, ease: 'power2.out' });
            });
            link.addEventListener('mouseleave', () => {
                gsap.to(link, { x: 0, y: 0, duration: 0.5, ease: 'power2.out' });
            });
        });
    }
})();
