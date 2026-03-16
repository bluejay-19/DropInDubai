// .js -> events page, displays data retrieved from the database, includes search and filter functionaliity 

// using the Fetch API call from server.js 
document.addEventListener("DOMContentLoaded", async () => {
    try{
        const response = await fetch("http://localhost:3000/api/events");
        const events = await response.json();

        const container = document.querySelector(".cards-grid");
        console.log("container found", container);
        
        container.innerHTML = "";

        events.forEach(event => {
            console.log(event.Name, event.ImagePath);
            const card = document.createElement("div");
            card.classList.add("event-card");
            // fallback image 
            const imageSrc = event.ImagePath ? event.ImagePath : "images/default-event.jpg";

            card.innerHTML = `
            <button class="fav-btn" 
                        data-id="${event.ID}" 
                        data-type="event">♡
            </button>
            <img src="${imageSrc}" alt="${event.Name}"/>
            <h3>${event.Name}</h3>
            <p>${event.Description}</p>
            <p><strong>Location: </strong> ${event.Location}</p>
            <p><strong>Start Date: </strong> ${new Date (event.Start_Date).toLocaleDateString()}</p>                   
            <p><strong>End Date: </strong> ${new Date (event.End_Date).toLocaleDateString()}</p>
            <p><strong>Price: </strong> ${event.Price}</p>
            <div class="card-actions">
                <button class="book-btn" 
                        data-id="${event.ID}" 
                        data-type="event" 
                        data-name="${event.Name}">
                    Book Now
                </button>
            </div>
            `;

            container.appendChild(card);
        });
    } catch(error){
        console.error("Error loading events:", error);
    }
});

// SEARCH & FILTER 
// Function to display events 
function displayEvents(events) {
    const container = document.querySelector(".cards-grid");
    container.innerHTML = "";
    
    if (events.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No events found matching your criteria.</p>';
        return;
    }
    
    events.forEach(event => {
        const card = document.createElement("div");
        card.classList.add("event-card");
        const imageSrc = event.ImagePath ? event.ImagePath : "images/default-event.jpg";

        card.innerHTML = `
        <button class="fav-btn" 
                    data-id="${event.ID}" 
                    data-type="event">♡
        </button>
        <img src="${imageSrc}" alt="${event.Name}"/>
        <h3>${event.Name}</h3>
        <p>${event.Description}</p>
        <p><strong>Location: </strong> ${event.Location}</p>
        <p><strong>Start Date: </strong> ${new Date(event.Start_Date).toLocaleDateString()}</p>                   
        <p><strong>End Date: </strong> ${new Date(event.End_Date).toLocaleDateString()}</p>
        <p><strong>Price: </strong> ${event.Price}</p>
        <div class="card-actions">
            <button class="book-btn" 
                    data-id="${event.ID}" 
                    data-type="event" 
                    data-name="${event.Name}">
                Book Now
            </button>
        </div>
        `;
        container.appendChild(card);
    });
}

// Filter form handler
document.querySelector('.filter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const search = document.getElementById('event-search').value;
    const type = document.getElementById('event-type').value;
    const date = document.getElementById('event-date').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (date) params.append('date', date);
    
    try {
        const response = await fetch(`http://localhost:3000/api/events/search?${params}`);
        const events = await response.json();
        displayEvents(events);
        console.log(`Found ${events.length} events`);
        
        // Re-initialize favorite states after filtering
        setTimeout(() => {
            if (window.updateFavoriteStates) {
                window.updateFavoriteStates();
            }
        }, 100);
    } catch (error) {
        console.error('Error filtering events:', error);
        alert('Error filtering events');
    }
});