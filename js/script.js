
document.addEventListener('DOMContentLoaded', function () {
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