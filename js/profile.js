// profile.js -> displays user details, bookings, favourites & account settings 
// allows users to manage their profile 

//using the FETCH API calls from server.js 

document.addEventListener("DOMContentLoaded", initProfilePage);

async function initProfilePage() {
  console.log("Profile page initializing...");
  const user = getCurrentUser();
  console.log("Current user:", user);
  
  if (!user) return redirectToLogin();

  await loadUserProfile(user.id);
  await loadUserBookings(user.id);
  await loadUserFavourites(user.id);
  setupNavigation();
  setupLogout();
  setupModal();
}

/* -----------------------------
    USER MANAGEMENT
------------------------------ */

function getCurrentUser() {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  return JSON.parse(storedUser);
}

function redirectToLogin() {
  alert("Please log in first.");
  window.location.href = "login.html";
}

/* LOAD USER PROFILE */

async function loadUserProfile(userId) {
  try {
    const res = await fetch(`http://localhost:3000/api/user/${userId}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.message || "Failed to load user");

    const user = data.user;
    updateProfileUI(user);

  } catch (err) {
    console.error("Error loading user profile:", err);
    alert("Error loading your profile details.");
  }
}

function updateProfileUI(user) {
  document.getElementById("profile-username").textContent = user.FullName;
  document.getElementById("profile-email").textContent = user.Email;
  document.querySelector(".avatar").src = user.ProfilePicture || "images/profile.jpg";

  const firstName = user.FullName.split(" ")[0];
  document.getElementById("welcome-message").textContent = `Welcome back, ${firstName}!`;

  // Fill settings form
  document.getElementById("name").value = user.FullName;
  document.getElementById("email").value = user.Email;
}

/* LOAD USER BOOKINGS */

async function loadUserBookings(userId) {
  console.log("Loading bookings for user:", userId);
  try {
    const res = await fetch(`http://localhost:3000/api/bookings/${userId}`);
    const data = await res.json();

    console.log("Bookings response:", data);

    if (!data.success) throw new Error("Failed to fetch bookings");

    // Render bookings in both dashboard and bookings section
    renderDashboardBookings(data.bookings);
    renderBookings(data.bookings);
  } catch (err) {
    console.error("Error loading bookings:", err);
  }
}

/* -----------------------------
    RENDER DASHBOARD BOOKINGS 
------------------------------ */

function renderDashboardBookings(bookings) {
  console.log("Rendering dashboard bookings:", bookings);
  
  const container = document.querySelector("#dashboard .dashboard-bookings");
  console.log("Dashboard container found:", container);
  
  if (!container) {
    console.error("ERROR: Dashboard container not found!");
    return;
  }

  container.innerHTML = "";

  // Filter for upcoming bookings only
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  const upcomingBookings = bookings.filter(b => {
    // IMPORTANT: Filter out cancelled bookings
    if (b.Status === 'cancelled') {
      console.log(`Filtering out cancelled booking: ${b.ItemName}`);
      return false;
    }
    
    // Only show confirmed bookings
    if (b.Status !== 'confirmed') {
      console.log(`Filtering out non-confirmed booking: ${b.ItemName} (Status: ${b.Status})`);
      return false;
    }
    
    // Check if booking has a CheckIn date
    if (b.CheckIn) {
      const checkInDate = new Date(b.CheckIn);
      checkInDate.setHours(0, 0, 0, 0);
      const isUpcoming = checkInDate >= today;
      console.log(`Booking ${b.ItemName}: CheckIn=${b.CheckIn}, isUpcoming=${isUpcoming}`);
      return isUpcoming;
    }
    
    // For bookings without CheckIn (like attractions/events), check CreatedAt
    // and include them if created recently (within last 30 days) as "upcoming"
    if (b.CreatedAt) {
      const createdDate = new Date(b.CreatedAt);
      const daysSinceCreated = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));
      const isRecent = daysSinceCreated <= 30;
      console.log(`Booking ${b.ItemName}: CreatedAt=${b.CreatedAt}, daysAgo=${daysSinceCreated}, isRecent=${isRecent}`);
      return isRecent;
    }
    
    // If no date info, include it
    console.log(`Booking ${b.ItemName}: No date info, including by default`);
    return true;
  }).slice(0, 3); // Show only the first 3 bookings 

  console.log(`Filtered bookings for dashboard: ${upcomingBookings.length} out of ${bookings.length}`);

  if (upcomingBookings.length === 0) {
    container.innerHTML = `<p>No upcoming bookings. Start exploring!</p>`;
    return;
  }

  upcomingBookings.forEach(b => {
    const card = createBookingCard(b);
    container.appendChild(card);
  });
  
  console.log("Dashboard bookings rendered successfully!");
}

/* -----------------------------
    RENDER ALL BOOKINGS
------------------------------ */

function renderBookings(bookings) {
  console.log("Rendering all bookings:", bookings);
  
  const container = document.querySelector("#bookings .booking-container");
  console.log("Bookings container found:", container);
  
  if (!container) {
    console.error("ERROR: Booking container not found!");
    return;
  }

  container.innerHTML = "";

  if (!bookings || bookings.length === 0) {
    container.innerHTML = `<p>No bookings yet. Start exploring and book your first experience!</p>`;
    return;
  }

  bookings.forEach(b => {
    const card = createBookingCard(b);
    container.appendChild(card);
  });

  console.log("Bookings rendered successfully!");
}

/* -----------------------------
    CREATE BOOKING CARD
------------------------------ */

function createBookingCard(b) {
  const card = document.createElement("div");
  card.classList.add("card");
  card.setAttribute("data-status", b.Status); // Add status attribute
  
  const showActions = b.Status !== 'cancelled';
  console.log(`Booking ${b.ID} - Status: ${b.Status}, Show Actions: ${showActions}`);
  
  card.innerHTML = `
    <img src="${b.ImagePath || 'images/default.jpg'}" alt="${b.ItemName}">
    <div class="card-content">
      <h3>${b.ItemName}</h3>
      <p class="card-category">${capitalize(b.ItemType)}</p>
      <p class="card-location">${b.Location || 'N/A'}</p>
      <p class="card-date">${b.CheckIn ? formatDate(b.CheckIn) : formatDate(b.CreatedAt)}</p>
      ${b.Guests ? `<p class="card-guests">${b.Guests} guest${b.Guests > 1 ? 's' : ''}</p>` : ''}
      <p class="card-status status-${b.Status}">
        <span class="status-badge">${capitalize(b.Status)}</span>
      </p>
      <button class="view-btn" 
        data-id="${b.ID}" 
        data-image="${b.ImagePath || 'images/default.jpg'}" 
        data-name="${b.ItemName}" 
        data-location="${b.Location || 'N/A'}" 
        data-status="${b.Status}"
        data-type="${b.ItemType}"
        data-checkin="${b.CheckIn || ''}"
        data-checkout="${b.CheckOut || ''}"
        data-guests="${b.Guests || ''}">
        View Details
      </button>
      ${showActions ? `
        <div class="booking-actions">
            <button class="modify-btn" data-id="${b.ID}">Modify Booking</button>
            <button class="cancel-btn" data-id="${b.ID}">Cancel Booking</button>
        </div>
      ` : ''}
    </div>
  `;
  
  return card;
}

/* -----------------------------
    LOAD USER FAVORITES
------------------------------ */

async function loadUserFavourites(userId) {
  console.log("Loading favorites for user:", userId);
  try {
    const res = await fetch(`http://localhost:3000/api/favorites/${userId}`);
    const data = await res.json();

    console.log("Favorites response:", data);

    if (!data.success) throw new Error("Failed to fetch favorites");

    renderFavorites(data.favorites);
  } catch (err) {
    console.error("Error loading favorites:", err);
  }
}

function renderFavorites(favorites) {
  console.log("Rendering favorites:", favorites);
  
  const container = document.querySelector("#favorites-container");
  
  if (!container) {
    console.error("ERROR: Favorites container not found!");
    return;
  }

  container.innerHTML = "";

  if (!favorites || favorites.length === 0) {
    container.innerHTML = `<p>No favorites yet. Start exploring and add your favorites!</p>`;
    return;
  }

  favorites.forEach(f => {
    const card = createFavoriteCard(f);
    container.appendChild(card);
  });

  console.log("Favorites rendered successfully!");
}

function createFavoriteCard(f) {
  const card = document.createElement("div");
  card.classList.add("card");
  
  card.innerHTML = `
    <img src="${f.ImagePath || 'images/default.jpg'}" alt="${f.ItemName}">
    <div class="card-content">
      <h3>${f.ItemName}</h3>
      <p class="card-category">${capitalize(f.ItemType)}</p>
      <p class="card-location"> ${f.Location || 'N/A'}</p>
      ${f.Price ? `<p class="card-price"> ${f.ItemType === 'hotel' ? 'AED ' + f.Price + '/night' : 'AED ' + f.Price}</p>` : ''}
      <button class="fav-btn active" 
        data-id="${f.ItemID}" 
        data-type="${f.ItemType}">♥</button>
      <button class="book-btn" 
        data-id="${f.ItemID}" 
        data-type="${f.ItemType}" 
        data-name="${f.ItemName}">
        Book Now
      </button>
    </div>
  `;
  
  return card;
}

/* -----------------------------
    NAVIGATION
------------------------------ */

function setupNavigation() {
  const navItems = document.querySelectorAll(".profile-nav li");
  const sections = document.querySelectorAll(".section");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      const target = item.getAttribute("data-target");
      
      // Update active nav item
      navItems.forEach(nav => nav.classList.remove("active"));
      item.classList.add("active");

      // Show target section
      sections.forEach(section => {
        section.classList.remove("section-active");
        if (section.id === target) {
          section.classList.add("section-active");
        }
      });
    });
  });
}

/* -----------------------------
    LOGOUT + SETTINGS
------------------------------ */

function setupLogout() {
  const logoutBtn = document.querySelector(".logout-btn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("user");
    alert("You've been logged out.");
    window.location.href = "login.html";
  });
}

/* -----------------------------
    MODAL HANDLING
------------------------------ */

function setupModal() {
  const modal = document.getElementById("bookingModal");
  const closeBtn = modal.querySelector(".close");

  document.body.addEventListener("click", e => {
    if (e.target.classList.contains("view-btn")) {
      const data = e.target.dataset;
      openModal(data);
    }
  });

  closeBtn.addEventListener("click", closeModal);
  window.addEventListener("click", e => {
    if (e.target === modal) closeModal();
  });
}

document.body.addEventListener("click", async (e) => {
  const user = getCurrentUser();

  // CANCEL BOOKING
  if (e.target.classList.contains("cancel-btn")) {
    const bookingId = e.target.dataset.id;
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id })
    });

    const data = await res.json();
    alert(data.message);
    if (data.success) loadUserBookings(user.id);
  }

  // MODIFY BOOKING
  if (e.target.classList.contains("modify-btn")) {
    const bookingId = e.target.dataset.id;
    openModifyModal(bookingId, user.id);
  }
});


function openModal(data) {
  const modal = document.getElementById("bookingModal");
  document.getElementById("modal-image").src = data.image || "images/default.jpg";
  document.getElementById("modal-title").textContent = data.name;
  document.getElementById("modal-status").textContent = `Status: ${capitalize(data.status)}`;
  document.getElementById("modal-location").textContent = `Location: ${data.location}`;
  
  // Add date info
  let dateInfo = "";
  if (data.checkin) {
    dateInfo = `${formatDate(data.checkin)}`;
    if (data.checkout) {
      dateInfo += ` - ${formatDate(data.checkout)}`;
    }
  }
  document.getElementById("modal-date").textContent = `Date: ${dateInfo}`;
  
  // Add description based on type
  const description = `This is a ${data.type || 'booking'} reservation. ${data.guests ? `Reserved for ${data.guests} guest(s).` : ''}`;
  document.getElementById("modal-description").textContent = description;
  
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
}


function openModifyModal(bookingId, userId) {
  // find the booking and get its type
  const bookingCard = document.querySelector(`[data-id="${bookingId}"]`);
  const bookingType = bookingCard ? bookingCard.dataset.type : 'hotel';
  
  console.log('Opening modify modal for booking type:', bookingType);
  
  const modal = document.createElement("div");
  modal.className = "booking-modal";
  
  // Only show check-in/out dates for hotels
  const showDates = bookingType === 'hotel';
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h2>Modify Booking</h2>
      <form id="modify-form">
        ${showDates ? `
          <label>Check-In Date</label>
          <input type="date" name="checkIn" required>

          <label>Check-Out Date</label>
          <input type="date" name="checkOut" required>
        ` : `
          <label>Visit Date</label>
          <input type="date" name="visitDate" required>
        `}

        <label>Number of Guests</label>
        <input type="number" name="guests" min="1" required>

        <button type="submit">Save Changes</button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Close modal
  modal.querySelector(".close-modal").onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

  // Handle form submission
  modal.querySelector("#modify-form").onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Build request body based on booking type
    const requestBody = {
      userId: userId,
      guests: formData.get("guests")
    };

    if (showDates) {
      // For hotels: send check-in and check-out
      requestBody.checkIn = formData.get("checkIn");
      requestBody.checkOut = formData.get("checkOut");
    } else {
      // For attractions/events/restaurants: send visit date as check-in
      requestBody.checkIn = formData.get("visitDate");
    }

    const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();
    alert(data.message);
    modal.remove();
    if (data.success) loadUserBookings(userId);
  };
}

/* -----------------------------
    UTILS
------------------------------ */

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* -----------------------------
    SETTINGS FORM + DELETE ACCOUNT
------------------------------ */

// Settings form submission
document.body.addEventListener("submit", async (e) => {
  if (e.target.id === "settings-form") {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user) return;
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    
    if (!name || !email) {
      alert("Please enter both name and email");
      return;
    }
    
    const updateData = { name, email };
    if (password) {
      updateData.password = password;
    }
    
    try {
      console.log("Updating user profile...");
      const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      
      const data = await res.json();
      console.log("Update response:", data);
      
      if (data.success) {
        // Update localStorage
        user.name = name;
        user.email = email;
        localStorage.setItem("user", JSON.stringify(user));
        
        // Update UI
        document.getElementById("profile-username").textContent = name;
        document.getElementById("profile-email").textContent = email;
        
        alert("Settings updated successfully!");
        
        // Clear password field
        if (password) {
          document.getElementById("password").value = "";
        }
      } else {
        alert(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      alert("Error updating settings. Please try again.");
    }
  }
});

// Delete account button
document.body.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    if (!confirm("WARNING: Are you ABSOLUTELY SURE you want to delete your account?\n\nThis will:\n- Delete all your bookings\n- Delete all your data\n- CANNOT be undone\n\nType 'DELETE' in the next prompt to confirm.")) {
      return;
    }
    
    const confirmation = prompt("Type DELETE (in capital letters) to confirm:");
    if (confirmation !== "DELETE") {
      alert("Account deletion cancelled.");
      return;
    }
    
    const user = getCurrentUser();
    if (!user) return;
    
    try {
      console.log("Deleting user account...");
      const res = await fetch(`http://localhost:3000/api/users/${user.id}`, {
        method: "DELETE"
      });
      
      const data = await res.json();
      console.log("Delete response:", data);
      
      if (data.success) {
        localStorage.removeItem("user");
        alert("Your account has been deleted.");
        window.location.href = "index.html";
      } else {
        alert(data.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error deleting account. Please try again.");
    }
  }
});


// Admin - "Back to admin" button 
// checks if the user is admin and adds a "back to admin page" button 
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));

    if(user && user.role === 'admin'){
      const adminBtn = document.getElementById('adminDashboardBtn');
      if(adminBtn){
        adminBtn.style.display = 'block';
      }
    }
});