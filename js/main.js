/**
 * St. Pete AI - Main JavaScript
 * Handles interactivity and Material Design component initialization
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Materialize Components
    initializeMaterializeComponents();

    // Initialize custom functionality
    initializeSmoothScroll();
    initializeNavbarScroll();
    initializeFormHandling();
    initializeAnimations();
});

/**
 * Initialize all Materialize CSS components
 */
function initializeMaterializeComponents() {
    // Mobile Navigation (Sidenav)
    const sidenavElems = document.querySelectorAll('.sidenav');
    M.Sidenav.init(sidenavElems, {
        edge: 'left',
        draggable: true
    });

    // Select dropdowns
    const selectElems = document.querySelectorAll('select');
    M.FormSelect.init(selectElems);

    // Tooltips (if any)
    const tooltipElems = document.querySelectorAll('.tooltipped');
    M.Tooltip.init(tooltipElems);

    // Modals (if any)
    const modalElems = document.querySelectorAll('.modal');
    M.Modal.init(modalElems);

    // Floating Action Buttons (if any)
    const fabElems = document.querySelectorAll('.fixed-action-btn');
    M.FloatingActionButton.init(fabElems);
}

/**
 * Smooth scroll for anchor links
 */
function initializeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');

            // Skip if it's just "#" or no target
            if (targetId === '#' || targetId === '#top') {
                if (targetId === '#top') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                return;
            }

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Close mobile nav if open
                const sidenav = document.querySelector('.sidenav');
                const sidenavInstance = M.Sidenav.getInstance(sidenav);
                if (sidenavInstance && sidenavInstance.isOpen) {
                    sidenavInstance.close();
                }

                // Calculate offset for fixed navbar
                const navHeight = document.querySelector('nav').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Navbar background change on scroll
 */
function initializeNavbarScroll() {
    const nav = document.querySelector('nav');
    const hero = document.querySelector('.hero-section');

    if (!nav || !hero) return;

    const heroHeight = hero.offsetHeight;

    function updateNavbar() {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
            nav.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        } else {
            nav.classList.remove('scrolled');
            nav.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
    }

    // Initial check
    updateNavbar();

    // Throttled scroll listener
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateNavbar();
                ticking = false;
            });
            ticking = true;
        }
    });
}

/**
 * Handle form submissions
 */
function initializeFormHandling() {
    const signupForm = document.getElementById('signup-form');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form values
            const firstName = document.getElementById('first_name').value.trim();
            const lastName = document.getElementById('last_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const interestsSelect = document.getElementById('interests');
            const interests = interestsSelect ? M.FormSelect.getInstance(interestsSelect).getSelectedValues() : [];

            // Basic validation
            if (!firstName || !lastName || !email) {
                M.toast({
                    html: '<i class="material-icons left">error</i>Please fill in all required fields',
                    classes: 'red darken-1 rounded'
                });
                return;
            }

            if (!isValidEmail(email)) {
                M.toast({
                    html: '<i class="material-icons left">error</i>Please enter a valid email address',
                    classes: 'red darken-1 rounded'
                });
                return;
            }

            // Simulate form submission (replace with actual API call)
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="material-icons left">hourglass_empty</i>Signing Up...';
            submitBtn.disabled = true;

            // Simulated API call
            setTimeout(function() {
                // Success message
                M.toast({
                    html: '<i class="material-icons left">check_circle</i>Welcome to St. Pete AI, ' + firstName + '!',
                    classes: 'green darken-1 rounded',
                    displayLength: 4000
                });

                // Reset form
                signupForm.reset();
                M.updateTextFields();

                // Reset select
                if (interestsSelect) {
                    const instance = M.FormSelect.getInstance(interestsSelect);
                    if (instance) {
                        instance.destroy();
                        M.FormSelect.init(interestsSelect);
                    }
                }

                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                console.log('Form submitted:', { firstName, lastName, email, interests });
            }, 1500);
        });
    }
}

/**
 * Initialize scroll-triggered animations
 */
function initializeAnimations() {
    // Elements to animate
    const animatedElements = document.querySelectorAll('.feature-card, .card, .collection, .contact-info, .community-platform');

    if (!animatedElements.length) return;

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Set initial state and observe
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        observer.observe(el);
    });

    // Add CSS for fade-in animation via JS
    const style = document.createElement('style');
    style.textContent = `
        .fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Utility: Email validation
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Utility: Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Throttle function for scroll events
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Expose functions globally if needed
window.StPeteAI = {
    showToast: function(message, type = 'info') {
        const classes = {
            'success': 'green darken-1',
            'error': 'red darken-1',
            'warning': 'orange darken-1',
            'info': 'blue darken-1'
        };
        M.toast({
            html: message,
            classes: (classes[type] || classes.info) + ' rounded'
        });
    }
};
