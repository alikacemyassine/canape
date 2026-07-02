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
        } else {
            nav.classList.remove('scrolled');
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
        
        // Robust mobile scroll lock
        document.body.style.overflow = open ? 'hidden' : '';
        document.body.style.touchAction = open ? 'none' : '';
        
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

    // --- SUPABASE CLIENT GLOBALS ---
    if (window.ENV && window.supabase) {
        window.sbClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
    }

    // Bind Wishlist & Cart buttons globally via Event Delegation
    document.addEventListener('click', async (e) => {
        const target = e.target;
        if (!target || typeof target.closest !== 'function') return;
        const btnCart = target.closest('#btn-cart');
        const btnReserve = target.closest('#btn-reserve');
        const packCta = target.closest('#pack-cta');
        const btnWishlist = target.closest('#btn-wishlist');

        if (!btnCart && !btnReserve && !packCta && !btnWishlist) return;

        const slug = document.body.dataset.productSlug || document.body.dataset.packSlug;
        const type = document.body.dataset.productSlug ? 'product' : 'pack';

        async function handleOrder(actionBtn, successText) {
            try {
                if (!window.sbClient && window.supabase && window.ENV) {
                    window.sbClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
                }
                if (!window.sbClient) {
                    alert('Erreur technique : connexion à la base de données impossible (Supabase manquant).');
                    return;
                }
                
                const originalText = actionBtn.textContent;
                actionBtn.textContent = 'En cours...';
                actionBtn.disabled = true;

                const { data: { session } } = await window.sbClient.auth.getSession();
                if (!session) {
                    alert('Veuillez vous connecter depuis votre compte pour réserver.');
                    window.location.href = '/account.html';
                    return;
                }

                if (!slug) {
                    alert('Erreur technique : Impossible de déterminer le produit.');
                    actionBtn.textContent = originalText;
                    actionBtn.disabled = false;
                    return;
                }

                const { error } = await window.sbClient.from('orders').insert([{
                    user_id: session.user.id,
                    product_slug: slug,
                    type: type
                }]);

                if (error) {
                    console.error("Order Insert Error:", error);
                    alert('Erreur lors de la réservation: ' + error.message);
                    actionBtn.textContent = originalText;
                    actionBtn.disabled = false;
                } else {
                    actionBtn.textContent = successText;
                    actionBtn.classList.add('bg-green-700', 'text-white');
                }
            } catch (err) {
                console.error("Order Exception:", err);
                alert('Une erreur inattendue est survenue: ' + err.message);
            }
        }

        if (btnCart || btnReserve || packCta) {
            const btn = btnCart || btnReserve || packCta;
            let text = 'Ajouté au panier !';
            if (btnReserve) text = 'Réservé !';
            if (packCta) text = 'Composition Réservée !';
            handleOrder(btn, text);
        }

        if (btnWishlist) {
            try {
                if (!window.sbClient && window.supabase && window.ENV) {
                    window.sbClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
                }
                if (!window.sbClient) {
                    alert('Erreur technique : connexion à la base de données impossible (Supabase manquant).');
                    return;
                }
                const icon = btnWishlist.querySelector('.material-symbols-outlined') || btnWishlist;
                
                const { data: { session } } = await window.sbClient.auth.getSession();
                if (!session) {
                    alert('Veuillez vous connecter pour ajouter aux favoris.');
                    window.location.href = '/account.html';
                    return;
                }

                if (!slug) {
                    alert('Erreur technique : Impossible de déterminer le produit.');
                    return;
                }

                // Petit effet de chargement sur l'icône
                gsap.to(icon, { opacity: 0.5, duration: 0.2 });

                const { error } = await window.sbClient.from('wishlists').insert([{
                    user_id: session.user.id,
                    product_slug: slug,
                    type: type
                }]);

                if (error) {
                    // Si le favori existe déjà, on l'enlève !
                    if (error.code === '23505') {
                        await window.sbClient.from('wishlists').delete().match({ user_id: session.user.id, product_slug: slug });
                        icon.textContent = 'favorite_border';
                        icon.style.fontVariationSettings = '"FILL" 0';
                        icon.classList.remove('text-brand-gold');
                        // Animation suppression (un-pop)
                        if (window.gsap) gsap.fromTo(icon, { scale: 1.2 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
                    } else {
                        console.error("Wishlist Insert Error:", error);
                        alert("Erreur lors de l'ajout aux favoris: " + error.message);
                        gsap.to(icon, { opacity: 1, duration: 0.2 });
                    }
                } else {
                    // Succès de l'ajout
                    icon.textContent = 'favorite';
                    icon.style.fontVariationSettings = '"FILL" 1';
                    icon.classList.add('text-brand-gold');
                    // Animation pop joyeuse
                    if (window.gsap) gsap.fromTo(icon, { scale: 0.5 }, { scale: 1.2, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }).then(() => {
                        gsap.to(icon, { scale: 1, duration: 0.2 });
                    });
                }
            } catch (err) {
                console.error("Wishlist Exception:", err);
                alert('Une erreur inattendue est survenue: ' + err.message);
            }
        }
    });

    // Helper pour initialiser l'état du bouton "Favori" au chargement de la page
    window.initializeWishlistState = async function(slug) {
        if (!slug) return;
        const btnWishlist = document.getElementById('btn-wishlist');
        if (!btnWishlist) return;

        try {
            if (!window.sbClient && window.supabase && window.ENV) {
                window.sbClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
            }
            if (!window.sbClient) return;

            const { data: { session } } = await window.sbClient.auth.getSession();
            if (!session) return;

            const { data } = await window.sbClient.from('wishlists').select('id').match({ user_id: session.user.id, product_slug: slug }).single();
            
            if (data) {
                const icon = btnWishlist.querySelector('.material-symbols-outlined') || btnWishlist;
                icon.textContent = 'favorite';
                icon.style.fontVariationSettings = '"FILL" 1';
                icon.classList.add('text-brand-gold');
            }
        } catch (err) {
            // Silently ignore if not found
        }
    };
})();

// Global Newsletter handler
window.handleNewsletterSubmit = async function(event) {
    event.preventDefault();
    const form = event.target;
    const input = form.querySelector('input[type="email"]');
    const email = input.value.trim();
    const btn = form.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;
    
    if (!email) return;
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Veuillez entrer une adresse email valide.');
        return;
    }
    
    // Ensure Supabase client is initialized
    if (!window.sbClient && window.supabase && window.ENV) {
        window.sbClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
    }
    if (!window.sbClient) {
        alert('Service temporairement indisponible. Veuillez réessayer plus tard.');
        return;
    }
    
    btn.disabled = true;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-sm">refresh</span>';
    
    try {
        const { error } = await window.sbClient.from('newsletter').insert({ email });
        
        if (error) {
            if (error.code === '23505') {
                alert('Cette adresse email est déjà inscrite !');
            } else {
                console.error(error);
                alert('Une erreur est survenue. Veuillez réessayer.');
            }
        } else {
            alert('Merci de votre inscription à notre newsletter !');
            input.value = '';
        }
    } catch (err) {
        console.error(err);
        alert('Une erreur est survenue.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
};
window.handleContactSubmit = async function(event) {
    event.preventDefault();
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const nameInput = form.querySelector('input[type="text"]');
    const messageInput = form.querySelector('textarea');
    const phoneInput = form.querySelector('input[type="tel"]');
    const email = emailInput ? emailInput.value.trim() : '';
    const name = nameInput ? nameInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const btn = form.querySelector('button[type="submit"]');
    const originalContent = btn.innerHTML;

    if (!email || !name) {
        alert('Veuillez remplir votre nom et adresse email.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Veuillez entrer une adresse email valide.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = 'Envoi...';

    try {
        if (!window.sbClient && window.supabase && window.ENV) {
            window.sbClient = window.supabase.createClient(window.ENV.SUPABASE_URL, window.ENV.SUPABASE_ANON_KEY);
        }

        if (window.sbClient) {
            // Save full contact request to dedicated table
            const { error } = await window.sbClient.from('contact_requests').insert({
                name,
                email,
                phone: phone || null,
                message: message || null,
                created_at: new Date().toISOString()
            });
            if (error) throw error;
        }

        // Show success and clear form
        alert('Message envoyé ! Nous vous contacterons très bientôt.');
        form.reset();
    } catch (err) {
        console.error(err);
        alert('Une erreur est survenue.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
};
