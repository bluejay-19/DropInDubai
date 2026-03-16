// restaurants.js -> restaurants page, displays data retrieved from the database, includes search and filter functionaliity 


// using the Fetch API all from server.js 
document.addEventListener("DOMContentLoaded", async () => {
    try{
        const response = await fetch("http://localhost:3000/api/restaurants");
        const restaurants = await response.json();

        const container = document.querySelector(".cards-grid");
        console.log("container found:", container);

        container.innerHTML = "";

        restaurants.forEach(restaurant => {
            const card = document.createElement("div");
            card.classList.add("restaurant-card");
            
            // fallback image 
            const imageSrc = restaurant.ImagePath ? restaurant.ImagePath : "images/default-restaurant.jpeg";

            card.innerHTML = `
            <button class="fav-btn" 
                        data-id="${restaurant.ID}" 
                        data-type="restaurant">♡
            </button>
            <img src="${restaurant.ImagePath}" alt ="${restaurant.Name}"/>
            <h3>${restaurant.Name}</h3>
            <p>${restaurant.Description}</p>
            <p><strong>Rating: </strong> ${restaurant.Rating}</p>
            <p><strong>Cuisine: </strong> ${restaurant.Cuisine}</p>
            <p><strong>Location: </strong> ${restaurant.Location}</p>
            <p><strong>Price: </strong> ${restaurant.Price_Range}</p>
            <div class="card-actions">
                <button class="book-btn" 
                        data-id="${restaurant.ID}" 
                        data-type="restaurant" 
                        data-name="${restaurant.Name}">
                    Book Now
                </button>
            </div>
            `;

            container.appendChild(card);
        });
    } catch (error){
        console.error("Error loading restaurants:", error);
    }
});

// SEARCH & FILTER 
// Function to display restaurants 
function displayRestaurants(restaurants) {
    const container = document.querySelector(".cards-grid");
    container.innerHTML = "";
    
    if (restaurants.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No restaurants found matching your criteria.</p>';
        return;
    }
    
    restaurants.forEach(restaurant => {
        const card = document.createElement("div");
        card.classList.add("restaurant-card");
        
        card.innerHTML = `
        <button class="fav-btn" 
                    data-id="${restaurant.ID}" 
                    data-type="restaurant">♡
        </button>
        <img src="${restaurant.ImagePath}" alt ="${restaurant.Name}"/>
        <h3>${restaurant.Name}</h3>
        <p>${restaurant.Description}</p>
        <p><strong>Rating: </strong> ${restaurant.Rating}</p>
        <p><strong>Cuisine: </strong> ${restaurant.Cuisine}</p>
        <p><strong>Location: </strong> ${restaurant.Location}</p>
        <p><strong>Price: </strong> ${restaurant.Price_Range}</p>
        <div class="card-actions">
            <button class="book-btn" 
                    data-id="${restaurant.ID}" 
                    data-type="restaurant" 
                    data-name="${restaurant.Name}">
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
    
    const search = document.getElementById('search').value;
    const cuisine = document.getElementById('cuisine').value;
    const rating = document.getElementById('rating').value;
    const priceRange = document.getElementById('priceRange').value;
    
    // If NO filters are selected, just reload all restaurants
    if (!search && !cuisine && !rating && !priceRange) {
        console.log('No filters selected, loading all restaurants');
        // Just refresh the page or do nothing
        return;
    }
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (cuisine) params.append('cuisine', cuisine);
    if (rating) params.append('rating', rating);
    if (priceRange) params.append('priceRange', priceRange);
    
    try {
        const response = await fetch(`http://localhost:3000/api/restaurants/search?${params}`);
        const restaurants = await response.json();
        displayRestaurants(restaurants);
        console.log(`Found ${restaurants.length} restaurants`);
        
        // Re-initialize favorite states after filtering
        setTimeout(() => {
            if (window.updateFavoriteStates) {
                window.updateFavoriteStates();
            }
        }, 100);
    } catch (error) {
        console.error('Error filtering restaurants:', error);
        alert('Error filtering restaurants');
    }
});