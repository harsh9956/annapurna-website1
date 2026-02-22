import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA8rSJo00EJ14T3apt3_S2moRYqRq35Nf4",
    authDomain: "annapurna-food-app-e1435.firebaseapp.com",
    projectId: "annapurna-food-app-e1435",
    storageBucket: "annapurna-food-app-e1435.firebasestorage.app",
    messagingSenderId: "900778815165",
    appId: "1:900778815165:web:ac52916ba6e04cad08d1d4"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = document.getElementById('contactSubmitBtn');
            const feedback = document.getElementById('contactFeedback');
            const originalText = btn.textContent;

            // Get Field Values
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const message = document.getElementById('contactMessage').value.trim();

            if (!name || !email || !message) {
                feedback.textContent = 'Please fill out all fields.';
                feedback.style.color = 'red';
                return;
            }

            // Loading state
            btn.textContent = 'Sending...';
            btn.disabled = true;
            feedback.textContent = '';
            feedback.style.color = '';

            try {
                // Add a new document with a generated id.
                const docRef = await addDoc(collection(db, "contact_messages"), {
                    name: name,
                    email: email,
                    message: message,
                    timestamp: serverTimestamp() // Adds server time
                });

                // Success State
                btn.textContent = originalText;
                btn.disabled = false;
                feedback.style.color = '#1e8e3e';
                feedback.textContent = 'Thank you! Your message has been securely sent to our team.';

                // Clear the form
                contactForm.reset();

                // Remove feedback after a few seconds
                setTimeout(() => {
                    feedback.textContent = '';
                }, 5000);

            } catch (error) {
                console.error("Error adding document: ", error);
                // Error State
                btn.textContent = originalText;
                btn.disabled = false;
                feedback.style.color = 'red';
                feedback.textContent = 'Oops! Something went wrong. Please try again later.';
            }
        });
    }
});
