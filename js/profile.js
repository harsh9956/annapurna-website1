document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Authentication state
    const token = localStorage.getItem('annapurna_token') || sessionStorage.getItem('annapurna_token');

    if (!token) {
        // If not logged in, redirect to login
        window.location.href = 'login.html';
        return;
    }

    // 2. Fetch User Data
    const userDataStr = localStorage.getItem('annapurna_user');

    if (userDataStr) {
        try {
            const user = JSON.parse(userDataStr);

            // Populate DOM Elements
            const nameElements = [document.getElementById('profileName'), document.getElementById('displayProfileName')];
            const emailElement = document.getElementById('displayProfileEmail');
            const idElement = document.getElementById('displayProfileId');
            const avatarElement = document.getElementById('profileAvatar');

            // Handle Name (Fallback to 'User' if name is null/empty)
            const displayName = user.name || "Guest User";
            nameElements.forEach(el => {
                if (el) el.textContent = displayName;
            });

            // Set Avatar Initial (first letter of name)
            if (avatarElement) {
                avatarElement.textContent = displayName.charAt(0).toUpperCase();
            }

            // Handle Email
            if (emailElement) {
                emailElement.textContent = user.email || "No email provided";
            }

            // Handle ID
            if (idElement) {
                idElement.textContent = user.id || "Local Profile";
            }

        } catch (error) {
            console.error("Error parsing user data:", error);
            document.getElementById('profileName').textContent = "Error loading profile";
        }
    } else {
        document.getElementById('profileName').textContent = "User Profile Data Missing";
    }

    // 3. Setup Logout Button on Profile Page
    const logoutBtn = document.getElementById('logoutBtnProfile');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('annapurna_token');
            sessionStorage.removeItem('annapurna_token');
            localStorage.removeItem('annapurna_user');

            // Clear cart on logout for security/cleanliness (optional, but good practice)
            if (window.Cart) {
                window.Cart.clearCart();
            }

            window.location.href = 'login.html';
        });
    }
});
