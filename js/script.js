document.addEventListener('DOMContentLoaded', () => {
    // Global Authentication Check for Protected Routes
    const token = localStorage.getItem('annapurna_token') || sessionStorage.getItem('annapurna_token');
    const isProtectedRoute = window.location.pathname.includes('checkout.html') || window.location.pathname.includes('orders.html');

    if (isProtectedRoute && !token) {
        // Redirect unauthenticated users to login page before they can view protected content
        window.location.href = 'login.html';
        return; // Stop execution
    }

    // Update Navbar based on Auth State
    const navLinksContainer = document.querySelector('.nav-links');
    if (navLinksContainer) {
        if (token) {
            // User is logged in, change Login/Register to Logout
            const loginLink = navLinksContainer.querySelector('a[href="login.html"]');
            const registerLink = navLinksContainer.querySelector('a[href="register.html"]');

            if (loginLink && loginLink.textContent !== 'Logout') {
                loginLink.textContent = 'Logout';
                loginLink.href = '#'; // Prevent default navigation
                loginLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('annapurna_token');
                    sessionStorage.removeItem('annapurna_token');
                    localStorage.removeItem('annapurna_user');
                    window.location.href = 'login.html';
                });
            }
            if (registerLink) {
                registerLink.style.display = 'none'; // Hide register link
            }
        }
    }
    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Active link highlighting on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');

            // Only highlight if it matches the current section, or if we are at the top and it's the home link
            if (current && href.includes(current)) {
                link.classList.add('active');
            } else if (!current && window.scrollY < 200 && (href === 'index.html#home' || href === 'index.html')) {
                link.classList.add('active');
            }
        });
    });

    // Menu Filtering Logic
    const menuButtons = document.querySelectorAll('.menu-btn');

    menuButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            menuButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            const filter = button.getAttribute('data-filter');
            const currentMenuItems = document.querySelectorAll('.menu-item');

            currentMenuItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300); // Wait for transition
                }
            });
        });
    });

    // Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-up');

    // Using a simpler animation approach since CSS handles the keyframes
    // We just add an 'animated' class or let intersection observer trigger it
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(el => {
        // Reset animation state for observer 
        el.style.animation = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';

        // Restore delay from class if present
        if (el.classList.contains('delay-1')) el.style.transitionDelay = '0.3s';
        if (el.classList.contains('delay-2')) el.style.transitionDelay = '0.6s';

        observer.observe(el);
    });


    // Dynamic Menu Loading via Backend API
    async function loadMenu() {
        try {
            // Attempt to fetch from the Node.js backend
            const response = await window.API.request('/menu');

            if (response && response.success && response.data) {
                const menuGrid = document.querySelector('.menu-grid');
                if (!menuGrid) return;

                // Clear the hardcoded fallback HTML
                menuGrid.innerHTML = '';

                // Render live DB menu items
                response.data.forEach((item, index) => {
                    const delayClass = index % 3 === 1 ? 'delay-1' : index % 3 === 2 ? 'delay-2' : '';

                    const html = `
                        <div class="menu-item fade-up ${delayClass} mix ${item.category} all" data-id="${item.id}" style="animation: none 0s ease 0s 1 normal none running; opacity: 1; transform: translateY(0px); transition: all 0.8s ease-out;">
                            <img src="${item.image_url}" alt="${item.name}">
                            <div class="menu-item-info">
                                <div class="menu-item-header">
                                    <h3>${item.name}</h3>
                                    <span class="price">₹${parseFloat(item.price).toFixed(2)}</span>
                                </div>
                                <p>${item.description}</p>
                                <button class="btn btn-outline btn-add-cart mt-2" style="width: 100%; padding: 0.5rem 1rem;">Add to Cart</button>
                            </div>
                        </div>
                    `;
                    menuGrid.insertAdjacentHTML('beforeend', html);
                });
            }
        } catch (error) {
            console.log("Backend offline or unreachable. Falling back to static hardcoded menu items in HTML.");
        }
    }

    // Initialize the dynamic menu fetch
    loadMenu();
});
