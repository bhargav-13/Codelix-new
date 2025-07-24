document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevButton = document.querySelector('.testimonial-nav.prev');
    const nextButton = document.querySelector('.testimonial-nav.next');
    let currentSlide = 0;
    let slideInterval;
    const slideDuration = 5000; // 5 seconds

    // Initialize the slider
    function initSlider() {
        if (slides.length === 0) return;
        
        // Show first slide and activate first dot
        showSlide(0);
        
        // Set up event listeners
        if (prevButton) prevButton.addEventListener('click', prevSlide);
        if (nextButton) nextButton.addEventListener('click', nextSlide);
        
        // Add click events to dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });
        
        // Start auto-rotation
        startAutoSlide();
        
        // Pause on hover
        const slider = document.querySelector('.testimonial-slider');
        if (slider) {
            slider.addEventListener('mouseenter', pauseSlide);
            slider.addEventListener('mouseleave', startAutoSlide);
            
            // Pause on focus for accessibility
            slider.addEventListener('focusin', pauseSlide);
            slider.addEventListener('focusout', startAutoSlide);
        }
    }
    
    // Show a specific slide
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show the selected slide and activate corresponding dot
        slides[index].classList.add('active');
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        // Update current slide index
        currentSlide = index;
    }
    
    // Go to next slide
    function nextSlide() {
        const nextIndex = (currentSlide + 1) % slides.length;
        showSlide(nextIndex);
    }
    
    // Go to previous slide
    function prevSlide() {
        const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prevIndex);
    }
    
    // Go to specific slide
    function goToSlide(index) {
        showSlide(index);
    }
    
    // Start auto-rotation
    function startAutoSlide() {
        // Clear any existing interval
        if (slideInterval) {
            clearInterval(slideInterval);
        }
        
        // Set new interval
        slideInterval = setInterval(nextSlide, slideDuration);
    }
    
    // Pause auto-rotation
    function pauseSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }
    
    // Initialize the slider when the DOM is loaded
    initSlider();
    
    // Add keyboard navigation for accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            pauseSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            pauseSlide();
        }
    });
});
