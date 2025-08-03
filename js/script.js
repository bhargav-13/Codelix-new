document.addEventListener('DOMContentLoaded', function () {
    // Initialize counter animation
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 16);
    }

    function setupCounterObserver() {
        const counters = document.querySelectorAll('.card h2');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    const target = parseInt(entry.target.textContent);
                    entry.target.textContent = '0';
                    animateCounter(entry.target, target);
                    entry.target.dataset.animated = 'true';
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    setupCounterObserver();

    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenuButton = document.getElementById('closeMenu');
    const overlay = document.getElementById('overlay');
    const menuIcon = menuToggle.querySelector('.menu-icon');

    // Function to open the side menu
    function openMenu() {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
        menuIcon.classList.add('active'); // Animate menu icon to close icon
    }

    // Function to close the side menu
    function closeMenu() {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
        menuIcon.classList.remove('active'); // Revert menu icon to hamburger
        document.body.style.overflow = ''; // Allow scrolling again
    }

    // Event listener for clicking the menu toggle (Menu text + icon)
    menuToggle.addEventListener('click', openMenu);

    // Event listener for clicking the close button inside the menu
    closeMenuButton.addEventListener('click', closeMenu);

    // Event listener for clicking the overlay to close the menu
    overlay.addEventListener('click', closeMenu);

    // Close menu if any menu item is clicked (optional, for single-page apps)
    const menuItems = sideMenu.querySelectorAll('a');
    menuItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });
});