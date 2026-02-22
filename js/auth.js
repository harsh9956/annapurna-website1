import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8rSJo00EJ14T3apt3_S2moRYqRq35Nf4",
    authDomain: "annapurna-food-app-e1435.firebaseapp.com",
    projectId: "annapurna-food-app-e1435",
    storageBucket: "annapurna-food-app-e1435.firebasestorage.app",
    messagingSenderId: "900778815165",
    appId: "1:900778815165:web:ac52916ba6e04cad08d1d4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Management Check:
    // If the user is already logged in, they shouldn't be on the login or register pages.
    // Redirect them to the Home Page seamlessly.
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
    const existingToken = localStorage.getItem('annapurna_token') || sessionStorage.getItem('annapurna_token');

    if (isAuthPage && existingToken) {
        window.location.href = 'index.html';
        return; // Stop execution on this page
    }

    // Pre-fill email on login page if they just registered
    if (window.location.pathname.includes('login.html')) {
        const registeredEmail = localStorage.getItem('annapurna_registered_email');
        if (registeredEmail) {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.value = registeredEmail;
            }
        }
    }

    // Login Form Validation
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let isValid = true;

            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!email.value || !emailPattern.test(email.value)) {
                email.classList.add('invalid');
                if (emailError) {
                    emailError.classList.add('show');
                }
                isValid = false;
            } else {
                email.classList.remove('invalid');
                if (emailError) {
                    emailError.classList.remove('show');
                }
            }

            if (!password.value) {
                password.classList.add('invalid');
                if (passwordError) {
                    passwordError.textContent = 'Password cannot be empty.';
                    passwordError.classList.add('show');
                }
                isValid = false;
            } else {
                password.classList.remove('invalid');
                if (passwordError) {
                    passwordError.classList.remove('show');
                }
            }

            if (isValid) {
                const btn = loginForm.querySelector('.auth-btn');
                const originalText = btn ? btn.textContent : 'Sign In';
                if (btn) {
                    btn.textContent = 'Logging in...';
                    btn.style.opacity = '0.8';
                }

                signInWithEmailAndPassword(auth, email.value, password.value)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        localStorage.setItem('annapurna_token', user.accessToken);
                        localStorage.setItem('annapurna_user', JSON.stringify({ email: user.email, name: user.displayName || "User", id: user.uid }));
                        triggerSuccess();
                    })
                    .catch((error) => {
                        if (passwordError) {
                            passwordError.textContent = error.message;
                            passwordError.classList.add('show');
                        }
                        if (btn) {
                            btn.textContent = originalText;
                            btn.style.opacity = '1';
                        }
                        console.error("Login mapping error:", error);
                    });

                function triggerSuccess() {
                    if (btn) {
                        btn.style.backgroundColor = '#1e8e3e';
                        btn.style.borderColor = '#1e8e3e';
                        btn.textContent = 'Success!';
                    }
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }
            }
        });

        document.querySelectorAll('.auth-form input').forEach(input => {
            input.addEventListener('input', function () {
                this.classList.remove('invalid');
                const errorSpan = document.getElementById(this.id + 'Error');
                if (errorSpan) errorSpan.classList.remove('show');
            });
        });
    }

    // Register Form Validation
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            let isValid = true;

            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const password = document.getElementById('password');
            const confirmPassword = document.getElementById('confirmPassword');

            const nameError = document.getElementById('nameError');
            const emailError = document.getElementById('emailError');
            const passwordError = document.getElementById('passwordError');
            const confirmPasswordError = document.getElementById('confirmPasswordError');

            if (!name.value.trim()) {
                name.classList.add('invalid');
                if (nameError) nameError.classList.add('show');
                isValid = false;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email.value || !emailPattern.test(email.value)) {
                email.classList.add('invalid');
                if (emailError) {
                    emailError.textContent = 'Please enter a valid email address.';
                    emailError.classList.add('show');
                }
                isValid = false;
            }

            if (password.value.length < 6) {
                password.classList.add('invalid');
                if (passwordError) {
                    passwordError.textContent = 'Password must be at least 6 characters.';
                    passwordError.classList.add('show');
                }
                isValid = false;
            }

            if (password.value !== confirmPassword.value || confirmPassword.value === '') {
                confirmPassword.classList.add('invalid');
                if (confirmPasswordError) {
                    confirmPasswordError.classList.add('show');
                }
                isValid = false;
            }

            if (isValid) {
                const btn = registerForm.querySelector('.auth-btn');
                const originalText = btn ? btn.textContent : 'Register';
                if (btn) {
                    btn.textContent = 'Creating account...';
                    btn.style.opacity = '0.8';
                }

                createUserWithEmailAndPassword(auth, email.value, password.value)
                    .then((userCredential) => {
                        triggerSuccess();
                    })
                    .catch((error) => {
                        console.error(error);
                        if (emailError) {
                            emailError.textContent = error.message;
                            emailError.classList.add('show');
                        }
                        if (btn) {
                            btn.textContent = originalText;
                            btn.style.opacity = '1';
                        }
                    });

                function triggerSuccess() {
                    if (btn) {
                        btn.style.backgroundColor = '#1e8e3e';
                        btn.style.borderColor = '#1e8e3e';
                        btn.textContent = 'Account Created ✓';
                    }
                    localStorage.setItem('annapurna_registered_email', email.value);
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1500);
                }
            }
        });

        document.querySelectorAll('.auth-form input').forEach(input => {
            input.addEventListener('input', function () {
                this.classList.remove('invalid');
                const errorSpan = document.getElementById(this.id + 'Error');
                if (errorSpan) errorSpan.classList.remove('show');
            });
        });
    }

    // Real Firebase Google Social Login
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const originalHtml = googleBtn.innerHTML;
            googleBtn.innerHTML = 'Connecting...';
            googleBtn.style.opacity = '0.8';

            signInWithPopup(auth, googleProvider)
                .then((result) => {
                    const user = result.user;
                    localStorage.setItem('annapurna_token', user.accessToken);
                    localStorage.setItem('annapurna_user', JSON.stringify({ name: user.displayName || "Google User", email: user.email, id: user.uid }));

                    googleBtn.innerHTML = 'Connected!';
                    googleBtn.style.backgroundColor = '#1e8e3e';
                    googleBtn.style.color = '#fff';
                    googleBtn.style.borderColor = '#1e8e3e';

                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                }).catch((error) => {
                    console.error("Google Auth Error", error);
                    googleBtn.innerHTML = originalHtml;
                    googleBtn.style.opacity = '1';
                    alert(error.message);
                });
        });
    }

    // Facebook Social Login Simulation
    const facebookBtn = document.querySelector('.btn-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const originalHtml = facebookBtn.innerHTML;
            facebookBtn.innerHTML = 'Connecting...';
            facebookBtn.style.opacity = '0.8';

            setTimeout(() => {
                localStorage.setItem('annapurna_token', 'simulated_facebook_jwt_token');
                localStorage.setItem('annapurna_user', JSON.stringify({ name: "Facebook User", email: "user@facebook.com" }));

                facebookBtn.innerHTML = 'Connected!';
                facebookBtn.style.backgroundColor = '#1877f2';
                facebookBtn.style.color = '#fff';
                facebookBtn.style.borderColor = '#1877f2';

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }, 1000);
        });
    }
});
