// admin.js - Admin Panel Functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user || user.role !== 'admin') {
        alert('Access denied. Admin only.');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Admin logged in:', user);
    
    // Load dashboard stats
    loadDashboardStats();
    
    // Load all bookings
    loadAllBookings();
    
    // Setup navigation
    setupNavigation();
    
    // Setup modal
    setupModal();
});
        
// ========== NAVIGATION ==========
function setupNavigation() {
    const menuItems = document.querySelectorAll('.sidebar li');
    const sections = document.querySelectorAll('.section');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionName = item.dataset.section;
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Show target section
            sections.forEach(sec => sec.classList.remove('active'));
            document.getElementById(sectionName).classList.add('active');
            
            // Load data for that section
            switch(sectionName) {
                case 'dashboard':
                    loadDashboardStats();
                    break;
                case 'bookings':
                    loadAllBookingsTable();
                    break;
                case 'hotels':
                    loadHotels();
                    break;
                case 'restaurants':
                    loadRestaurants();
                    break;
                case 'attractions':
                    loadAttractions();
                    break;
                case 'events':
                    loadEvents();
                    break;
            }
        });
    });
}

// ========== DASHBOARD ==========
async function loadDashboardStats() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/stats');
        const stats = await response.json();
        
        console.log('Stats loaded:', stats);
        
        // Update cards
        const cards = document.querySelectorAll('.admincard p');
        cards[0].textContent = stats.totalUsers || 0;
        cards[1].textContent = (stats.totalHotels + stats.totalRestaurants + stats.totalAttractions + stats.totalEvents) || 0;
        cards[2].textContent = stats.totalBookings || 0;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadAllBookings() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/bookings');
        const bookings = await response.json();
        
        console.log('All bookings loaded:', bookings.length);
        
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

// ========== LOAD LISTINGS ==========
async function loadHotels() {
    try {
        const response = await fetch('http://localhost:3000/api/hotels');
        const hotels = await response.json();
        
        const tbody = document.querySelector('#hotelsTable tbody') || 
                     createTableBody('hotelsTable');
        tbody.innerHTML = '';
        
        hotels.forEach(hotel => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${hotel.Name}</td>
                <td>${hotel.Location}</td>
                <td>${hotel.Price_Per_Night} AED</td>
                <td>${hotel.Room_Type}</td>
                <td class="actions">
                    <button onclick="editHotel(${hotel.ID})">Edit</button>
                    <button onclick="deleteHotel(${hotel.ID})">Delete</button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

async function loadRestaurants() {
    try {
        const response = await fetch('http://localhost:3000/api/restaurants');
        const restaurants = await response.json();
        
        const tbody = document.querySelector('#restaurantsTable tbody') || 
                     createTableBody('restaurantsTable');
        tbody.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${restaurant.Name}</td>
                <td>${restaurant.Cuisine}</td>
                <td>${restaurant.Rating}</td>
                <td>${restaurant.Location}</td>
                <td class="actions">
                    <button onclick="editRestaurant(${restaurant.ID})">Edit</button>
                    <button onclick="deleteRestaurant(${restaurant.ID})">Delete</button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading restaurants:', error);
    }
}

async function loadAttractions() {
    try {
        const response = await fetch('http://localhost:3000/api/attractions');
        const attractions = await response.json();
        
        const tbody = document.querySelector('#attractionsTable tbody') || 
                     createTableBody('attractionsTable');
        tbody.innerHTML = '';
        
        attractions.forEach(attraction => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${attraction.Name}</td>
                <td>${attraction.Location}</td>
                <td>${attraction.Category}</td>
                <td>${attraction.Price} AED</td>
                <td class="actions">
                    <button onclick="editAttraction(${attraction.ID})">Edit</button>
                    <button onclick="deleteAttraction(${attraction.ID})">Delete</button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading attractions:', error);
    }
}

async function loadEvents() {
    try {
        const response = await fetch('http://localhost:3000/api/events');
        const events = await response.json();
        
        const tbody = document.querySelector('#eventsTable tbody') || 
                     createTableBody('eventsTable');
        tbody.innerHTML = '';
        
        events.forEach(event => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${event.Name}</td>
                <td>${new Date(event.Start_Date).toLocaleDateString()}</td>
                <td>${event.Location}</td>
                <td>${event.Category}</td>
                <td class="actions">
                    <button onclick="editEvent(${event.ID})">Edit</button>
                    <button onclick="deleteEvent(${event.ID})">Delete</button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

// Helper function to create tbody if table doesn't have one
function createTableBody(tableId) {
    const table = document.getElementById(tableId);
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    return tbody;
}

// ======== MODAL SETUP ==========
let currentEditId = null;
let currentEditType = null;

function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

function openAddModal(type) {
    currentEditId = null;
    currentEditType = type;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    modalTitle.textContent = `Add ${capitalize(type)}`;
    form.innerHTML = getFormFields(type);
    
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    currentEditId = null;
    currentEditType = null;
}

function getFormFields(type) {
    switch(type) {
        case 'hotel':
            return `
                <input type="text" id="name" placeholder="Hotel Name" required>
                <input type="text" id="roomType" placeholder="Room Type (Single/Double/Suite)" required>
                <textarea id="description" placeholder="Description" required></textarea>
                <input type="text" id="location" placeholder="Location" required>
                <input type="number" id="price" placeholder="Price Per Night (AED)" required>
                <select id="stars" required>
                    <option value="">Select Stars</option>
                    <option value="***">3 Stars</option>
                    <option value="****">4 Stars</option>
                    <option value="*****">5 Stars</option>
                </select>
                <input type="text" id="capacity" placeholder="Capacity (e.g., 2 adults)" required>
                <input type="text" id="imagePath" placeholder="Image Path (e.g., images/hotel.jpg)" required>
                <button type="submit">Save</button>
            `;
        case 'restaurant':
            return `
                <input type="text" id="name" placeholder="Restaurant Name" required>
                <textarea id="description" placeholder="Description" required></textarea>
                <input type="text" id="location" placeholder="Location" required>
                <input type="text" id="cuisine" placeholder="Cuisine Type" required>
                <input type="text" id="priceRange" placeholder="Price Range (e.g., 200 or 150-300)" required>
                <input type="number" id="rating" placeholder="Rating (1-5)" step="0.1" min="1" max="5" required>
                <input type="text" id="imagePath" placeholder="Image Path" required>
                <button type="submit">Save</button>
            `;
        case 'attraction':
            return `
                <input type="text" id="name" placeholder="Attraction Name" required>
                <textarea id="description" placeholder="Description" required></textarea>
                <input type="text" id="location" placeholder="Location" required>
                <input type="number" id="rating" placeholder="Rating (1-5)" step="0.1" min="1" max="5" required>
                <input type="number" id="price" placeholder="Price (AED)" required>
                <input type="text" id="category" placeholder="Category (Museum/Theme park/etc)" required>
                <input type="text" id="imagePath" placeholder="Image Path" required>
                <button type="submit">Save</button>
            `;
        case 'event':
            return `
                <input type="text" id="name" placeholder="Event Name" required>
                <textarea id="description" placeholder="Description" required></textarea>
                <input type="text" id="location" placeholder="Location" required>
                <input type="date" id="startDate" placeholder="Start Date" required>
                <input type="date" id="endDate" placeholder="End Date" required>
                <input type="text" id="price" placeholder="Price (e.g., 200 or Free)" required>
                <input type="text" id="category" placeholder="Category (Festival/Sports/etc)" required>
                <input type="text" id="imagePath" placeholder="Image Path" required>
                <button type="submit">Save</button>
            `;
    }
}

// Handling form submission
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'modalForm') {
        e.preventDefault();
        
        const formData = getFormData(currentEditType);
        
        if (currentEditId) {
            // Update existing listing
            await updateListing(currentEditType, currentEditId, formData);
        } else {
            // Add new listing
            await addListing(currentEditType, formData);
        }
        
        closeModal();
    }
});

function getFormData(type) {
    const data = {};
    
    switch(type) {
        case 'hotel':
            data.name = document.getElementById('name').value;
            data.roomType = document.getElementById('roomType').value;
            data.description = document.getElementById('description').value;
            data.location = document.getElementById('location').value;
            data.price = document.getElementById('price').value;
            data.stars = document.getElementById('stars').value;
            data.capacity = document.getElementById('capacity').value;
            data.imagePath = document.getElementById('imagePath').value;
            break;
        case 'restaurant':
            data.name = document.getElementById('name').value;
            data.description = document.getElementById('description').value;
            data.location = document.getElementById('location').value;
            data.cuisine = document.getElementById('cuisine').value;
            data.priceRange = document.getElementById('priceRange').value;
            data.rating = document.getElementById('rating').value;
            data.imagePath = document.getElementById('imagePath').value;
            break;
        case 'attraction':
            data.name = document.getElementById('name').value;
            data.description = document.getElementById('description').value;
            data.location = document.getElementById('location').value;
            data.rating = document.getElementById('rating').value;
            data.price = document.getElementById('price').value;
            data.category = document.getElementById('category').value;
            data.imagePath = document.getElementById('imagePath').value;
            break;
        case 'event':
            data.name = document.getElementById('name').value;
            data.description = document.getElementById('description').value;
            data.location = document.getElementById('location').value;
            data.startDate = document.getElementById('startDate').value;
            data.endDate = document.getElementById('endDate').value;
            data.price = document.getElementById('price').value;
            data.category = document.getElementById('category').value;
            data.imagePath = document.getElementById('imagePath').value;
            break;
    }
    
    return data;
}

// ========== ADD LISTING ==========
async function addListing(type, data) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/${type}s`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`${capitalize(type)} added successfully!`);
            // Reload the table
            switch(type) {
                case 'hotel': loadHotels(); break;
                case 'restaurant': loadRestaurants(); break;
                case 'attraction': loadAttractions(); break;
                case 'event': loadEvents(); break;
            }
        } else {
            alert('Failed to add listing');
        }
    } catch (error) {
        console.error('Error adding listing:', error);
        alert('Error adding listing');
    }
}

// ========== EDIT FUNCTIONS ==========
async function editHotel(id) {
    currentEditId = id;
    currentEditType = 'hotel';
    
    // Fetch hotel data
    const response = await fetch('http://localhost:3000/api/hotels');
    const hotels = await response.json();
    const hotel = hotels.find(h => h.ID === id);
    
    if (!hotel) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    modalTitle.textContent = 'Edit Hotel';
    form.innerHTML = getFormFields('hotel');
    
    // Fill form with existing data
    document.getElementById('name').value = hotel.Name;
    document.getElementById('roomType').value = hotel.Room_Type;
    document.getElementById('description').value = hotel.Description;
    document.getElementById('location').value = hotel.Location;
    document.getElementById('price').value = hotel.Price_Per_Night;
    document.getElementById('stars').value = hotel.Stars;
    document.getElementById('capacity').value = hotel.Capacity;
    document.getElementById('imagePath').value = hotel.ImagePath;
    
    modal.style.display = 'flex';
}

async function editRestaurant(id) {
    currentEditId = id;
    currentEditType = 'restaurant';
    
    const response = await fetch('http://localhost:3000/api/restaurants');
    const restaurants = await response.json();
    const restaurant = restaurants.find(r => r.ID === id);
    
    if (!restaurant) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    modalTitle.textContent = 'Edit Restaurant';
    form.innerHTML = getFormFields('restaurant');
    
    document.getElementById('name').value = restaurant.Name;
    document.getElementById('description').value = restaurant.Description;
    document.getElementById('location').value = restaurant.Location;
    document.getElementById('cuisine').value = restaurant.Cuisine;
    document.getElementById('priceRange').value = restaurant.Price_Range;
    document.getElementById('rating').value = restaurant.Rating;
    document.getElementById('imagePath').value = restaurant.ImagePath;
    
    modal.style.display = 'flex';
}

async function editAttraction(id) {
    currentEditId = id;
    currentEditType = 'attraction';
    
    const response = await fetch('http://localhost:3000/api/attractions');
    const attractions = await response.json();
    const attraction = attractions.find(a => a.ID === id);
    
    if (!attraction) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    modalTitle.textContent = 'Edit Attraction';
    form.innerHTML = getFormFields('attraction');
    
    document.getElementById('name').value = attraction.Name;
    document.getElementById('description').value = attraction.Description;
    document.getElementById('location').value = attraction.Location;
    document.getElementById('rating').value = attraction.Rating;
    document.getElementById('price').value = attraction.Price;
    document.getElementById('category').value = attraction.Category;
    document.getElementById('imagePath').value = attraction.ImagePath;
    
    modal.style.display = 'flex';
}

async function editEvent(id) {
    currentEditId = id;
    currentEditType = 'event';
    
    const response = await fetch('http://localhost:3000/api/events');
    const events = await response.json();
    const event = events.find(e => e.ID === id);
    
    if (!event) return;
    
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('modalForm');
    
    modalTitle.textContent = 'Edit Event';
    form.innerHTML = getFormFields('event');
    
    document.getElementById('name').value = event.Name;
    document.getElementById('description').value = event.Description;
    document.getElementById('location').value = event.Location;
    document.getElementById('startDate').value = event.Start_Date;
    document.getElementById('endDate').value = event.End_Date;
    document.getElementById('price').value = event.Price;
    document.getElementById('category').value = event.Category;
    document.getElementById('imagePath').value = event.ImagePath;
    
    modal.style.display = 'flex';
}

// ========== UPDATE LISTING ==========
async function updateListing(type, id, data) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/${type}s/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`${capitalize(type)} updated successfully!`);
            switch(type) {
                case 'hotel': loadHotels(); break;
                case 'restaurant': loadRestaurants(); break;
                case 'attraction': loadAttractions(); break;
                case 'event': loadEvents(); break;
            }
        } else {
            alert('Failed to update listing');
        }
    } catch (error) {
        console.error('Error updating listing:', error);
        alert('Error updating listing');
    }
}

// ========== DELETE FUNCTIONS ==========
async function deleteHotel(id) {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    await deleteListing('hotel', id);
    loadHotels();
}

async function deleteRestaurant(id) {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    await deleteListing('restaurant', id);
    loadRestaurants();
}

async function deleteAttraction(id) {
    if (!confirm('Are you sure you want to delete this attraction?')) return;
    await deleteListing('attraction', id);
    loadAttractions();
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await deleteListing('event', id);
    loadEvents();
}

async function deleteListing(type, id) {
    try {
        const response = await fetch(`http://localhost:3000/api/admin/${type}s/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`${capitalize(type)} deleted successfully!`);
        } else {
            alert('Failed to delete listing');
        }
    } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Error deleting listing');
    }
}

// ========== BOOKINGS MANAGEMENT ==========

async function loadAllBookingsTable() {
    try {
        const response = await fetch('http://localhost:3000/api/admin/bookings');
        const bookings = await response.json();
        
        console.log('All bookings loaded:', bookings);
        
        const tbody = document.querySelector('#bookingsTable tbody');
        if (!tbody) {
            console.error('Bookings table body not found');
            return;
        }
        
        tbody.innerHTML = '';
        
        if (bookings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No bookings yet</td></tr>';
            return;
        }
        
        bookings.forEach(booking => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${booking.ID}</td>
                <td>${booking.user_name}</td>
                <td>${booking.user_email}</td>
                <td>${booking.item_name}</td>
                <td>${capitalize(booking.ItemType)}</td>
                <td>${booking.CheckIn ? formatDate(booking.CheckIn) : 'N/A'}</td>
                <td>${booking.CheckOut ? formatDate(booking.CheckOut) : 'N/A'}</td>
                <td><span class="status-badge status-${booking.Status}">${capitalize(booking.Status)}</span></td>
                <td class="actions">
                    ${booking.Status === 'confirmed' ? 
                        `<button onclick="cancelUserBooking(${booking.ID})">Cancel</button>` : 
                        '<span style="color: #999;">Cancelled</span>'}
                    <button onclick="deleteUserBooking(${booking.ID})" style="background-color: #e74c3c;">Delete</button>
                </td>
            `;
        });
        
    } catch (error) {
        console.error('Error loading all bookings:', error);
        alert('Error loading bookings');
    }
}

async function cancelUserBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/admin/bookings/${bookingId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Booking cancelled successfully!');
            loadAllBookingsTable(); // Reload the table
        } else {
            alert('Failed to cancel booking: ' + result.message);
        }
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Error cancelling booking');
    }
}

// Add permanent delete function for admin
// if the admin simply cancels a booking its cancelled for the user but it remains as an entry in the datbase 
// if the admin deletes a booking its cancelled for the user and it is removed from the database 
async function deleteUserBooking(bookingId) {
    if (!confirm('WARNING: This will PERMANENTLY DELETE this booking. This action cannot be undone. Are you sure?')) return;
    
    try {
        const response = await fetch(`http://localhost:3000/api/admin/bookings/${bookingId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Booking deleted permanently!');
            loadAllBookingsTable(); // Reload the table
        } else {
            alert('Failed to delete booking: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ========== CHARTS INITIALIZATION FOR THE DASHBOARD ==========

document.addEventListener('DOMContentLoaded', () => {
    initializeCharts();
});

function initializeCharts() {
    // Pie Chart
    const pieCtx = document.getElementById('pieChart');
    if (pieCtx) {
        new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: ['Hotels', 'Restaurants', 'Attractions', 'Events'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#024CAA', '#EC8305', '#091057', '#DBD3D3']
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false 
            }
        });
    }

    // Line Chart
    const lineCtx = document.getElementById('lineChart');
    if (lineCtx) {
        new Chart(lineCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Bookings',
                    data: [300, 400, 500, 700, 800, 950],
                    borderColor: '#024CAA',
                    fill: false,
                    tension: 0.3
                }]
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                scales: { 
                    y: { beginAtZero: true } 
                } 
            }
        });
    }
}

// ========== UTILS ==========
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make functions globally available
window.editHotel = editHotel;
window.editRestaurant = editRestaurant;
window.editAttraction = editAttraction;
window.editEvent = editEvent;
window.deleteHotel = deleteHotel;
window.deleteRestaurant = deleteRestaurant;
window.deleteAttraction = deleteAttraction;
window.deleteEvent = deleteEvent;
window.openAddModal = openAddModal;
window.cancelUserBooking = cancelUserBooking;
window.deleteUserBooking = deleteUserBooking;
