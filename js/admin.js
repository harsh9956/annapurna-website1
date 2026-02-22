document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Authentication and Admin role
    const token = localStorage.getItem('annapurna_token') || sessionStorage.getItem('annapurna_token');
    const userStr = localStorage.getItem('annapurna_user');

    if (!token || !userStr) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const user = JSON.parse(userStr);
        if (user.is_admin !== 1) {
            // Not an admin, redirect to home
            alert("Unauthorized: You do not have permission to access the admin dashboard.");
            window.location.href = 'index.html';
            return;
        }
    } catch (e) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Fetch and render orders immediately
    fetchOrders();
});

async function fetchOrders() {
    const token = localStorage.getItem('annapurna_token') || sessionStorage.getItem('annapurna_token');
    const tbody = document.getElementById('adminOrdersBody');

    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">Fetching latest orders...</td></tr>';

    try {
        const response = await fetch('http://localhost:5000/api/orders/all', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            renderOrders(result.data);
        } else {
            throw new Error(result.message || "Failed to fetch orders");
        }
    } catch (error) {
        console.error('Error fetching admin orders:', error);
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('adminOrdersBody');
    tbody.innerHTML = '';

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 3rem;">No orders found in the system yet.</td></tr>';
        return;
    }

    orders.forEach(order => {
        const tr = document.createElement('tr');

        // Format Items list
        const itemsHtml = `<ul class="order-items-list">` +
            order.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('') +
            `</ul>`;

        // Format Payment Badge
        let paymentBadgeClass = 'badge-warning';
        if (order.status_payment === 'Paid') paymentBadgeClass = 'badge-success';

        tr.innerHTML = `
            <td>
                <strong>${order.id}</strong><br>
                <small style="color: #666;">${order.date}</small>
            </td>
            <td>
                <strong>${order.customer.name}</strong><br>
                📞 ${order.customer.phone}<br>
                ✉️ ${order.customer.email}
            </td>
            <td>${itemsHtml}</td>
            <td style="font-weight: 600;">₹${order.total}</td>
            <td>
                <span class="badge ${paymentBadgeClass}">${order.status_payment}</span><br>
                <small>${order.paymentType.toUpperCase()}</small>
            </td>
            <td>
                <select class="status-select" id="status-${order.id}">
                    <option value="Processing" ${order.status_delivery === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Preparing" ${order.status_delivery === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Out for Delivery" ${order.status_delivery === 'Out for Delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="Delivered" ${order.status_delivery === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Cancelled" ${order.status_delivery === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="updateOrderStatus('${order.id}')">Save</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function updateOrderStatus(orderId) {
    const selectEl = document.getElementById(`status-${orderId}`);
    const newStatus = selectEl.value;
    const token = localStorage.getItem('annapurna_token') || sessionStorage.getItem('annapurna_token');

    try {
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status_delivery: newStatus })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            alert(`Order ${orderId} status successfully updated to: ${newStatus}`);
        } else {
            throw new Error(result.message || "Failed to update status");
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        alert(`Error updating status: ${error.message}`);

        // Re-fetch to reset the UI if update failed
        fetchOrders();
    }
}
