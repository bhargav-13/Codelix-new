document.addEventListener('DOMContentLoaded', function() {
    // Get all step elements and their corresponding content
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    const processContainer = document.querySelector('.process-container');
    
    // Function to set the active step and content
    function setActiveStep(stepNumber, scrollBehavior = 'auto') {
        // Remove active class from all steps and contents
        steps.forEach(step => step.classList.remove('active'));
        stepContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to the selected step and corresponding content
        const selectedStep = document.querySelector(`.step[data-step="${stepNumber}"]`);
        const selectedContent = document.getElementById(`step-${stepNumber}`);
        
        if (selectedStep && selectedContent) {
            selectedStep.classList.add('active');
            selectedContent.classList.add('active');
            
            // Only scroll if this was triggered by keyboard or click
            if (scrollBehavior === 'smooth') {
                selectedStep.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }
        }
    }
    
    // Add click event listeners to each step
    steps.forEach(step => {
        step.addEventListener('click', function() {
            const stepNumber = this.getAttribute('data-step');
            setActiveStep(stepNumber, 'smooth');
        });
    });
    
    // Track scroll position to update active step
    let ticking = false;
    let lastScrollTop = 0;
    
    function updateActiveStepOnScroll() {
        if (!processContainer) return;
        
        const containerRect = processContainer.getBoundingClientRect();
        const containerTop = containerRect.top + window.scrollY;
        const containerBottom = containerTop + containerRect.height;
        
        let closestStep = null;
        let minDistance = Infinity;
        
        steps.forEach(step => {
            const stepRect = step.getBoundingClientRect();
            const stepTop = stepRect.top + window.scrollY;
            const stepBottom = stepTop + stepRect.height;
            
            // Calculate distance from viewport center
            const viewportCenter = window.scrollY + (window.innerHeight / 2);
            const stepCenter = stepTop + (stepRect.height / 2);
            const distance = Math.abs(viewportCenter - stepCenter);
            
            // If this step is closer to the center than previous ones
            if (distance < minDistance) {
                minDistance = distance;
                closestStep = step;
            }
        });
        
        if (closestStep) {
            const stepNumber = closestStep.getAttribute('data-step');
            const currentActive = document.querySelector('.step.active');
            
            if (!currentActive || currentActive.getAttribute('data-step') !== stepNumber) {
                setActiveStep(stepNumber, 'auto');
            }
        }
        
        ticking = false;
    }
    
    // Throttle scroll events for better performance
    window.addEventListener('scroll', function() {
        lastScrollTop = window.scrollY;
        
        if (!ticking) {
            window.requestAnimationFrame(updateActiveStepOnScroll);
            ticking = true;
        }
    });
    
    // Handle touch events for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', e => {
        touchEndY = e.touches[0].clientY;
        // Prevent default to allow smooth scrolling on iOS
        if (Math.abs(touchEndY - touchStartY) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Set the first step as active by default
    if (steps.length > 0) {
        setActiveStep('1', 'auto');
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const activeStep = document.querySelector('.step.active');
        if (!activeStep) return;
        
        const currentStep = parseInt(activeStep.getAttribute('data-step'));
        let nextStep = null;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextStep = Math.min(currentStep + 1, steps.length);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            nextStep = Math.max(currentStep - 1, 1);
        } else if (e.key === 'Home') {
            nextStep = 1;
        } else if (e.key === 'End') {
            nextStep = steps.length;
        }
        
        if (nextStep !== null && nextStep !== currentStep) {
            e.preventDefault();
            setActiveStep(nextStep.toString(), 'smooth');
        }
    });
});
