/**
 * booking.js - Booking functionality (hotels, attractions, events, restaurants)
 * Handles "Book Now" button clicks across all pages
 */
console.log("Booking buttons initialized!");


// Get logged-in user from localStorage
function getLoggedInUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Initialize booking buttons
function initializeBookingButtons() {
    document.addEventListener('click', async (e) => {
        // Check if clicked element is a book button
        if (e.target.classList.contains('book-btn')) {
            e.preventDefault();
            
            const user = getLoggedInUser();
            
            // Check if user is logged in
            if (!user) {
                alert('Please log in to make a booking');
                window.location.href = 'login.html';
                return;
            }

            // Get booking details from button data attributes
            const itemId = e.target.getAttribute('data-id');
            const itemType = e.target.getAttribute('data-type');
            const itemName = e.target.getAttribute('data-name');

            console.log("Book button clicked:", itemType, itemId, itemName);


            // Show booking modal/form
            showBookingModal(itemId, itemType, itemName, user.id);
        }
    });
}

// Show booking modal with form
function showBookingModal(itemId, itemType, itemName, userId) {
    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'booking-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Book ${itemName}</h2>
            <form id="booking-form">
                <input type="hidden" name="userId" value="${userId}">
                <input type="hidden" name="itemId" value="${itemId}">
                <input type="hidden" name="itemType" value="${itemType}">
                
                ${itemType === 'hotel' ? `
                    <label>
                        Check-in Date
                        <input type="date" name="checkIn" required min="${getTodayDate()}">
                    </label>
                    <label>
                        Check-out Date
                        <input type="date" name="checkOut" required min="${getTodayDate()}">
                    </label>
                ` : itemType === 'restaurant' ? `
                    <label>
                        Reservation Date
                        <input type="date" name="checkIn" required min="${getTodayDate()}">
                    </label>
                ` : itemType === 'event' ? `
                    <label>
                        Event Date
                        <input type="date" name="checkIn" required min="${getTodayDate()}">
                    </label>
                ` : ''}
                
                <label>
                    Number of Guests
                    <input type="number" name="guests" min="1" value="1" required>
                </label>
                
                <div class="modal-actions">
                    <button type="submit" class="confirm-btn">Confirm Booking</button>
                    <button type="button" class="cancel-btn">Cancel</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handlers
    modal.querySelector('.close-modal').onclick = () => modal.remove();
    modal.querySelector('.cancel-btn').onclick = () => modal.remove();
    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    // Form submission
    modal.querySelector('#booking-form').onsubmit = async (e) => {
        e.preventDefault();
        await handleBookingSubmission(e.target, modal);
    };
}

// Handle booking form submission
async function handleBookingSubmission(form, modal) {
    const formData = new FormData(form);
    const bookingData = {
        userId: parseInt(formData.get('userId')),
        itemType: formData.get('itemType'),
        itemID: parseInt(formData.get('itemId')),
        checkIn: formData.get('checkIn') || null,
        checkOut: formData.get('checkOut') || null,
        guests: parseInt(formData.get('guests'))
    };

    try {
        const response = await fetch('http://localhost:3000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Booking confirmed successfully!');
            modal.remove();
        } else {
            alert('Booking failed: ' + result.message);
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred while making the booking');
    }
}

// Helper function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBookingButtons);