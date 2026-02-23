// Sign Up Form Validation and Handling
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (validateSignupForm()) {
            submitSignupForm();
        }
    });

    // Real-time validation
    document.getElementById('firstName').addEventListener('blur', validateFirstName);
    document.getElementById('lastName').addEventListener('blur', validateLastName);
    document.getElementById('email').addEventListener('blur', validateEmail);
    document.getElementById('department').addEventListener('blur', validateDepartment);
    document.getElementById('level').addEventListener('blur', validateLevel);
    document.getElementById('password').addEventListener('blur', validatePassword);
    document.getElementById('confirmPassword').addEventListener('blur', validateConfirmPassword);

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
function validateFirstName() {
    const firstName = document.getElementById('firstName').value.trim();
    const error = document.getElementById('firstNameError');
    
    if (firstName === '') {
        showError(error, 'First name is required');
        return false;
    }
    
    if (firstName.length < 2) {
        showError(error, 'First name must be at least 2 characters');
        return false;
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
        showError(error, 'First name can only contain letters, spaces, hyphens, and apostrophes');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateLastName() {
    const lastName = document.getElementById('lastName').value.trim();
    const error = document.getElementById('lastNameError');
    
    if (lastName === '') {
        showError(error, 'Last name is required');
        return false;
    }
    
    if (lastName.length < 2) {
        showError(error, 'Last name must be at least 2 characters');
        return false;
    }
    
    if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
        showError(error, 'Last name can only contain letters, spaces, hyphens, and apostrophes');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateEmail() {
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
    
    // Check if email exists in Local Storage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const emailExists = users.some(user => user.email === email);
    
    if (emailExists) {
        showError(error, 'Email already registered. Please sign in or use a different email');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateDepartment() {
    const department = document.getElementById('department').value.trim();
    const error = document.getElementById('departmentError');
    
    if (department === '') {
        showError(error, 'Department is required');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateLevel() {
    const level = document.getElementById('level').value.trim();
    const error = document.getElementById('levelError');
    
    if (level === '') {
        showError(error, 'Level is required');
        return false;
    }
    
    clearError(error);
    return true;
}

function validatePassword() {
    const password = document.getElementById('password').value;
    const error = document.getElementById('passwordError');
    
    if (password === '') {
        showError(error, 'Password is required');
        return false;
    }
    
    if (password.length < 8) {
        showError(error, 'Password must be at least 8 characters');
        return false;
    }
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        showError(error, 'Password must contain uppercase, lowercase, and numbers');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateConfirmPassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const error = document.getElementById('confirmPasswordError');
    
    if (confirmPassword === '') {
        showError(error, 'Please confirm your password');
        return false;
    }
    
    if (password !== confirmPassword) {
        showError(error, 'Passwords do not match');
        return false;
    }
    
    clearError(error);
    return true;
}

function validateSignupForm() {
    const isFirstNameValid = validateFirstName();
    const isLastNameValid = validateLastName();
    const isEmailValid = validateEmail();
    const isDepartmentValid = validateDepartment();
    const isLevelValid = validateLevel();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    return isFirstNameValid && isLastNameValid && isEmailValid && isDepartmentValid && isLevelValid && isPasswordValid && isConfirmPasswordValid;
}

function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    const formGroup = element.closest('.form-group');
    const input = formGroup.querySelector('input, select');
    if (input) input.classList.add('error');
}

function clearError(element) {
    element.textContent = '';
    element.classList.remove('show');
    const formGroup = element.closest('.form-group');
    const input = formGroup.querySelector('input, select');
    if (input) input.classList.remove('error');
}

function submitSignupForm() {
    const submitBtn = signupForm.querySelector('.btn-auth');
    const generalError = document.getElementById('generalError');
    
    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    const formData = new FormData(signupForm);
    
    // Simulate API call - in production, send to PHP backend
    setTimeout(() => {
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            department: formData.get('department'),
            level: formData.get('level'),
            password: formData.get('password'), // In production, hash this on the server
            createdAt: new Date().toISOString(),
            active: true
        };
        
        try {
            // Get existing users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Check if email already exists
            if (users.some(user => user.email === userData.email)) {
                generalError.textContent = 'Email already registered';
                generalError.classList.add('show');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                return;
            }
            
            // Add new user
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Store current session
            localStorage.setItem('currentUser', JSON.stringify(userData));
            sessionStorage.setItem('sessionUser', JSON.stringify(userData));
            
            // Show success message
            setTimeout(() => {
                // Redirect to dashboard or home page
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            generalError.textContent = 'An error occurred during signup. Please try again.';
            generalError.classList.add('show');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }, 1500);
}

// Clear error on input
document.querySelectorAll('.auth-form input').forEach(input => {
    input.addEventListener('input', function() {
        const error = this.parentElement.querySelector('.error-message');
        if (error && error.classList.contains('show')) {
            clearError(error);
        }
    });
});

// Clear error on select change
document.querySelectorAll('.auth-form select').forEach(select => {
    select.addEventListener('change', function() {
        const error = this.parentElement.querySelector('.error-message');
        if (error && error.classList.contains('show')) {
            clearError(error);
        }
    });
});

// Toggle password visibility
function togglePasswordVisibility(btn) {
    const targetId = btn.getAttribute('data-target');
    const input = document.getElementById(targetId);
    const eyeOpen = btn.querySelector('.eye-open');
    const eyeClosed = btn.querySelector('.eye-closed');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
    }
}

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
