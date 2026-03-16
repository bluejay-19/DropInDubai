// hotels.js -> hotels page, displays data retrieved from the database, includes search and filter functionaliity 
                
// using the Fetch API call from server.js

document.addEventListener("DOMContentLoaded", async () => {
    try{
        const response = await fetch("http://localhost:3000/api/hotels");
        const hotels = await response.json();

        const container = document.querySelector(".cards-grid"); 
        container.innerHTML = "";

        hotels.forEach(hotel => {
            const card = document.createElement("div");
            card.classList.add("hotel-card");

            // fallback image 
            const imageSrc = hotel.ImagePath ? hotel.ImagePath : "images/default-hotel.jpg";

            card.innerHTML = `
            <div>
                <button class="fav-btn" 
                        data-id="${hotel.ID}" 
                        data-type="hotel">  ♡
                </button>
                <img src="${hotel.ImagePath}" alt="${hotel.Name}"/>
                <h3>${hotel.Name}</h3>
                <p>${hotel.Description}</p>
                 <p><strong>Rating: </strong> ${hotel.Stars.replace(/\*/g, '⭐')}</p>
                <p><strong>Location: </strong> ${hotel.Location}</p>
                <p><strong>Price:</strong> AED ${hotel.Price_Per_Night}</p>
                <div class="card-actions">
                    <button class="book-btn" 
                            data-id="${hotel.ID}" 
                            data-type="hotel" 
                            data-name="${hotel.Name}">
                        Book Now
                    </button>
                </div>
            </div>
            `;

            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading hotels:", error);
    }
});

// SEARCH & FILTER 
// Function to display hotels 
function displayHotels(hotels) {
    const container = document.querySelector(".cards-grid");
    container.innerHTML = "";
    
    if (hotels.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No hotels found matching your criteria.</p>';
        return;
    }
    
    hotels.forEach(hotel => {
        const card = document.createElement("div");
        card.classList.add("hotel-card");

        card.innerHTML = `
        <div>
            <img src="${hotel.ImagePath}" alt="${hotel.Name}"/>
            <h3>${hotel.Name}</h3>
            <p>${hotel.Description}</p>
            <p><strong>Rating: </strong> ${hotel.Stars.replace(/\*/g, '⭐')}</p>
            <p><strong>Location: </strong> ${hotel.Location}</p>
            <p><strong>Price:</strong> AED ${hotel.Price_Per_Night}</p>
            <div class="card-actions">
                <button class="book-btn" 
                        data-id="${hotel.ID}" 
                        data-type="hotel" 
                        data-name="${hotel.Name}">
                    Book Now
                </button>
            </div>
        </div>
        `;
        container.appendChild(card);
    });
}


// Filter form handler
document.querySelector('.filter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const search = document.getElementById('search').value;
    const rating = document.getElementById('rating').value;
    const roomType = document.getElementById('roomType').value;
    const priceRange = document.getElementById('priceRange').value;
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (rating) params.append('rating', rating);
    if (roomType) params.append('roomType', roomType);
    if (priceRange) params.append('priceRange', priceRange);
    if (adults) params.append('adults', adults);
    if (children) params.append('children', children);
    
    try {
        const response = await fetch(`http://localhost:3000/api/hotels/search?${params}`);
        const hotels = await response.json();
        displayHotels(hotels);
        console.log(`Found ${hotels.length} hotels`);
    } catch (error) {
        console.error('Error filtering hotels:', error);
        alert('Error filtering hotels');
    }
});