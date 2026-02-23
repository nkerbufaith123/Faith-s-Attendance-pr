// Login Form Validation and Handling
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateLoginForm()) {
            submitLoginForm();
        }
    });

    // Real-time validation
    document.getElementById('email').addEventListener('blur', validateLoginEmail);
    document.getElementById('password').addEventListener('blur', validateLoginPassword);

    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.toggle-password-btn');
    passwordToggles.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            togglePasswordVisibility(btn);
        });
    });
}

// Validation Functions
function validateLoginEmail() {
    const email = document.getElementById('email').value.trim();
    const error = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email === '') {
        showError(error, 'Email is required');
        return false;
    }
    
    if (!emailRegex.test(email)) {
        showError(error, 'Please enter a valid email address');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateLoginPassword() {
    const password = document.getElementById('password').value;
    const error = document.getElementById('passwordError');
    
    if (password === '') {
        showError(error, 'Password is required');
        return false;
    }
    
    if (password.length < 1) {
        showError(error, 'Invalid password');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateLoginForm() {
    const isEmailValid = validateLoginEmail();
    const isPasswordValid = validateLoginPassword();
    
    return isEmailValid && isPasswordValid;
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    element.closest('.form-group').querySelector('input').classList.add('error');
}

function clearError(element) {
    element.textContent = '';
    element.classList.remove('show');
    element.closest('.form-group').querySelector('input').classList.remove('error');
}

function submitLoginForm() {
    const submitBtn = loginForm.querySelector('.btn-auth');
    const generalError = document.getElementById('generalError');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.querySelector('input[name="rememberMe"]').checked;
    
    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    generalError.classList.remove('show');
    
    // Simulate API call - in production, send to PHP backend
    setTimeout(() => {
        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find user by email
            const user = users.find(u => u.email === email);
            
            if (!user) {
                generalError.textContent = 'Email not found. Please sign up first.';
                generalError.classList.add('show');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                return;
            }
            
            // Validate password
            if (user.password !== password) {
                generalError.textContent = 'Invalid email or password. Please try again.';
                generalError.classList.add('show');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                return;
            }
            
            // Login successful
            const userData = {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt
            };
            
            // Store session
            localStorage.setItem('currentUser', JSON.stringify(userData));
            sessionStorage.setItem('sessionUser', JSON.stringify(userData));
            
            // Remember me functionality
            if (rememberMe) {
                localStorage.setItem('rememberMe', email);
            } else {
                localStorage.removeItem('rememberMe');
            }
            
            // Show success and redirect
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            generalError.textContent = 'An error occurred during login. Please try again.';
            generalError.classList.add('show');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }, 1500);
}

// Load remembered email
window.addEventListener('load', () => {
    const rememberedEmail = localStorage.getItem('rememberMe');
    if (rememberedEmail) {
        document.getElementById('email').value = rememberedEmail;
        document.querySelector('input[name="rememberMe"]').checked = true;
    }
});

// Clear error on input
document.querySelectorAll('.auth-form input').forEach(input => {
    input.addEventListener('input', function() {
        if (this.type === 'password' || this.type === 'email') {
            const error = this.parentElement.querySelector('.error-message');
            if (error && error.classList.contains('show')) {
                clearError(error);
            }
        }
    });
});

// Toggle password visibility
function togglePasswordVisibility(btn) {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// Forgot password link (placeholder)
const forgotPasswordLink = document.querySelector('.forgot-password');
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Password reset functionality coming soon!');
    });
}
