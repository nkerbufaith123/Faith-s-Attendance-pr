// Admin authentication handler (logic-only)
(function(){
    const ADMIN_EMAIL = 'faithdeves@gmail.com';
    const ADMIN_PASSWORD = '@gmail.com';

    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function(e){
        const email = (document.getElementById('email').value||'').trim();
        const password = (document.getElementById('password').value||'');

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            e.preventDefault();
            // Prevent other submit handlers
            e.stopImmediatePropagation && e.stopImmediatePropagation();

            // Create admin session
            const adminData = { firstName: 'Admin', email: ADMIN_EMAIL, isAdmin: true, createdAt: new Date().toISOString() };
            localStorage.setItem('currentUser', JSON.stringify(adminData));
            sessionStorage.setItem('sessionUser', JSON.stringify(adminData));

            // Ensure an admin marker
            localStorage.setItem('adminSession', JSON.stringify({ email: ADMIN_EMAIL, loggedAt: new Date().toISOString() }));

            // show welcome message quickly then redirect
            const generalError = document.getElementById('generalError');
            if (generalError) { generalError.textContent = 'Welcome Admin'; generalError.classList.add('show'); }

            setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 600);
        }
    }, false);
})();
