/* ============================================
   HI-ABC Website - Main JavaScript
   첨단바이오융합연구소
   ============================================ */

// Hero Slider with Ken Burns Effect
class HeroSlider {
    constructor() {
        this.slides = document.querySelectorAll('.hero-slide');
        this.dots = document.querySelectorAll('.slider-dot');
        this.currentSlide = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 6000;

        if (this.slides.length > 0) this.init();
    }

    init() {
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.stopAutoPlay();
                this.goToSlide(index);
                this.startAutoPlay();
            });
        });

        this.startAutoPlay();

        const slider = document.getElementById('heroSlider');
        if (slider) {
            slider.addEventListener('mouseenter', () => this.stopAutoPlay());
            slider.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevSlide();
            if (e.key === 'ArrowRight') this.nextSlide();
        });
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;

        this.slides[this.currentSlide].classList.remove('active');
        this.dots[this.currentSlide].classList.remove('active');

        this.currentSlide = index;

        this.slides[this.currentSlide].classList.add('active');
        this.dots[this.currentSlide].classList.add('active');
    }

    nextSlide() {
        this.goToSlide((this.currentSlide + 1) % this.slides.length);
    }

    prevSlide() {
        this.goToSlide((this.currentSlide - 1 + this.slides.length) % this.slides.length);
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }
}

// Scroll Animations with IntersectionObserver
class ScrollAnimations {
    constructor() {
        this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Stagger card animations
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const cards = entry.target.querySelectorAll('.animate-card');
                    cards.forEach((card, i) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, i * 150);
                    });
                    cardObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.research-grid, .activities-grid').forEach(grid => {
            const cards = grid.querySelectorAll('.animate-card');
            cards.forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            });
            cardObserver.observe(grid);
        });
    }
}

// Counter Animation for Stats
class StatCounter {
    constructor() {
        this.statNumbers = document.querySelectorAll('.stat-number[data-target]');
        if (this.statNumbers.length > 0) this.init();
    }

    init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        this.statNumbers.forEach(el => observer.observe(el));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const start = performance.now();

        const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

        const update = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const easedProgress = easeOutQuart(progress);
            element.textContent = Math.floor(target * easedProgress);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(update);
    }
}

// Navigation
class Navigation {
    constructor() {
        this.navbar = document.querySelector('.navbar-main');
        this.toggle = document.getElementById('navbarToggle');
        this.menu = document.getElementById('navbarMenu');
        this.navItems = document.querySelectorAll('.nav-item');

        if (this.navbar) this.init();
    }

    init() {
        // Mobile toggle
        if (this.toggle) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
        }

        // Mobile dropdown
        this.navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    if (this.isMobile() && item.querySelector('.dropdown-menu')) {
                        e.preventDefault();
                        // Close other dropdowns
                        this.navItems.forEach(other => {
                            if (other !== item) other.classList.remove('active');
                        });
                        item.classList.toggle('active');
                    }
                });
            }
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Scroll effect
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY > 10) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }
            lastScroll = scrollY;
        }, { passive: true });
    }

    toggleMenu() {
        this.menu.classList.toggle('active');
        this.toggle.classList.toggle('active');
    }

    closeMenu() {
        if (this.menu) this.menu.classList.remove('active');
        if (this.toggle) this.toggle.classList.remove('active');
        this.navItems.forEach(item => item.classList.remove('active'));
    }

    isMobile() {
        return window.innerWidth <= 768;
    }
}

// Lazy Image Loading with blur-up effect
class LazyImages {
    constructor() {
        this.init();
    }

    init() {
        if ('loading' in HTMLImageElement.prototype) {
            // Native lazy loading supported
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '200px' });

        document.querySelectorAll('img[data-src]').forEach(img => {
            observer.observe(img);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new HeroSlider();
    new ScrollAnimations();
    new StatCounter();
    new Navigation();
    new LazyImages();
});

// Page load animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
