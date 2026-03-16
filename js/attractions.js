// attractions.js -> attractions page, displays data retrieved from the database, includes search and filter functionaliity 

// using the Fetch API call from server.js
document.addEventListener("DOMContentLoaded", async () => {
    try{
        const response = await fetch("http://localhost:3000/api/attractions");
        const attractions = await response.json();

        const container = document.querySelector(".cards-grid"); 
        console.log("container found:", container);

        container.innerHTML = "";

        attractions.forEach(attraction => {
            const card = document.createElement("div");
            card.classList.add("attraction-card");

            // fallback image 
            const imageSrc = attraction.ImagePath ? attraction.ImagePath : "images/default-attraction.avif";

            card.innerHTML = `
            <button class="fav-btn" 
                        data-id="${attraction.ID}" 
                        data-type="attraction">♡
            </button>
            <img src="${attraction.ImagePath}" alt ="${attraction.Name}"/>
            <h3>${attraction.Name}</h3>
            <p>${attraction.Description}</p>
            <p><strong>Rating: </strong> ${attraction.Rating}</p>
            <p><strong>Location: </strong> ${attraction.Location}</p>
            <p><strong>Price: </strong> ${attraction.Price}</p>
            <div class="card-actions">
                <button class="book-btn" 
                        data-id="${attraction.ID}" 
                        data-type="attraction" 
                        data-name="${attraction.Name}">
                    Book Now
                </button>
            </div>
            `;

            container.appendChild(card);
        });
    } catch(error){
        console.error("Error loading attractions:", error);
    }
});


// SEARCH & FILTER 
// Function to display attractions 
function displayAttractions(attractions) {
    const container = document.querySelector(".cards-grid");
    container.innerHTML = "";
    
    if (attractions.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 2rem;">No attractions found matching your criteria.</p>';
        return;
    }
    
    attractions.forEach(attraction => {
        const card = document.createElement("div");
        card.classList.add("attraction-card");

        card.innerHTML = `
        <button class="fav-btn" 
                    data-id="${attraction.ID}" 
                    data-type="attraction">♡
        </button>
        <img src="${attraction.ImagePath}" alt ="${attraction.Name}"/>
        <h3>${attraction.Name}</h3>
        <p>${attraction.Description}</p>
        <p><strong>Rating: </strong> ${attraction.Rating}</p>
        <p><strong>Location: </strong> ${attraction.Location}</p>
        <p><strong>Price: </strong> ${attraction.Price}</p>
        <div class="card-actions">
            <button class="book-btn" 
                    data-id="${attraction.ID}" 
                    data-type="attraction" 
                    data-name="${attraction.Name}">
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
    const type = document.getElementById('type').value;
    const rating = document.getElementById('rating').value;
    const priceRange = document.getElementById('priceRange').value;
    
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (type) params.append('type', type);
    if (rating) params.append('rating', rating);
    if (priceRange) params.append('priceRange', priceRange);
    
    try {
        const response = await fetch(`http://localhost:3000/api/attractions/search?${params}`);
        const attractions = await response.json();
        displayAttractions(attractions);
        console.log(`Found ${attractions.length} attractions`);
        
        // Re-initialize favorite states after filtering
        setTimeout(() => {
            if (window.updateFavoriteStates) {
                window.updateFavoriteStates();
            }
        }, 100);
    } catch (error) {
        console.error('Error filtering attractions:', error);
        alert('Error filtering attractions');
    }
});