document.addEventListener('DOMContentLoaded', function() {
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        // Check if element is in viewport with 20% threshold
        return (
            rect.top <= windowHeight * 0.8 &&
            rect.left <= windowWidth * 0.8 &&
            rect.bottom >= 0 &&
            rect.right >= 0
        );
    }

    // Function to handle scroll animations
    function handleScrollAnimations() {
        const sections = document.querySelectorAll('.section-animate');
        
        sections.forEach(section => {
            if (isInViewport(section)) {
                section.classList.add('animate');
            }
        });
    }

    // Run once on page load
    handleScrollAnimations();

    // Debounce function for scroll events
    let scrollTimeout;
    function debounceScroll() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(handleScrollAnimations, 50);
    }

    // Add scroll event listener
    window.addEventListener('scroll', debounceScroll);

    // Re-run on window resize
    window.addEventListener('resize', debounceScroll);
});
