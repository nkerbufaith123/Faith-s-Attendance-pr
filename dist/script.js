// Mobile Menu Toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when a link is clicked
const mobileMenuLinks = mobileMenu.querySelectorAll('a');
mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
const navLinks = document.querySelectorAll('a[href^="#"]');
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerOffset = 80;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// FAQ Accordion Functionality
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach((question, index) => {
    question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        const faqAnswer = question.nextElementSibling;
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            if (item !== faqItem) {
                item.classList.remove('open');
            }
        });
        
        // Toggle current FAQ item
        faqItem.classList.toggle('open');
    });
});

// Intersection Observer for fade-in effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .pricing-card, .integration-card, .faq-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});

// Button clicks (for demo purposes)
const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-cta, .btn-pricing');
ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        if (!button.getAttribute('href')) {
            e.preventDefault();
            console.log('Button clicked: ' + (button.textContent || 'No text'));
            // You can add analytics or other tracking here
        }
    });
});

// Add hover effect to cards
const cards = document.querySelectorAll('.feature-card, .step-card, .testimonial-card, .pricing-card, .integration-card');
cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s ease';
    });
});

// Pricing card selection (for future backend integration)
const pricingButtons = document.querySelectorAll('.btn-pricing');
pricingButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const planName = button.closest('.pricing-card').querySelector('h3').textContent;
        console.log('Selected plan: ' + planName);
        // Integrate with your backend/payment system here
    });
});

// Form handling (if you add forms)
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add your form submission logic here
        console.log('Form submitted');
    });
});

// Active link highlighting in navigation
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Lazy load images
if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Log page load
window.addEventListener('load', () => {
    console.log('✨ AttendancePro Landing Page Loaded Successfully');
});

// Prevent body scroll when mobile menu is open
function preventScroll(e) {
    e.preventDefault();
}

mobileMenuBtn.addEventListener('click', () => {
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        document.addEventListener('touchmove', preventScroll, false);
    } else {
        document.body.style.overflow = 'auto';
        document.removeEventListener('touchmove', preventScroll, false);
    }
});

console.log('✨ Script loaded successfully');
