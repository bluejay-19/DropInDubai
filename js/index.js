// index.js -> displays rotating carousels for top hotels/restaurants/events/attractions

// using the Fetch api calls from server.js 
// /api/top-hotels 
async function loadTopHotels() {
        try{
        const response = await fetch("http://localhost:3000/api/top-hotels");
        const hotels = await response.json();

        const container = document.querySelector(".top-hotels-cards");
        console.log("container found:", container);

        container.innerHTML = "";

        hotels.forEach(hotel => {
            const card = document.createElement("div");
            card.classList.add("card","top-hotels-card");

            card.innerHTML = `
            <div>
            <img src="${hotel.ImagePath}" alt ="${hotel.Name}"/>
            <h3>${hotel.Name}</h3>
            <p>${hotel.Description}</p>
            </div>
            `;

            container.appendChild(card);
        });
    } catch(error) {
        console.error("Error loading attractions:", error);
    }
}

     
// /api/top-restaurants 
async function loadTopRestaurants()  {
    try{
        const response = await fetch("http://localhost:3000/api/top-restaurants");
        const restaurants = await response.json();

        const container = document.querySelector(".top-restaurants-cards");
        console.log("container found:", container);

        container.innerHTML = "";

        restaurants.forEach(restaurant => {
            const card = document.createElement("div");
            card.classList.add("card", "top-restaurant-card");

            card.innerHTML = `
            <div>
            <img src="${restaurant.ImagePath}" alt ="${restaurant.Name}"/>
            <h3>${restaurant.Name}</h3>
            <p>${restaurant.Description}</p>
            </div>
            `;

            container.appendChild(card);
        });
    } catch(error) {
        console.error("Error loading restaurants:", error);
    }
}

// /api/top-attractions
async function loadTopAttractions()  {
    try{
        const response = await fetch("http://localhost:3000/api/top-attractions");
        const attractions = await response.json();

        const container = document.querySelector(".top-attractions-cards");
        console.log("container found:", container);

        container.innerHTML = "";

        attractions.forEach(attraction => {
            const card = document.createElement("div");
            card.classList.add("card","top-attraction-card");

            card.innerHTML = `
            <div>
            <img src="${attraction.ImagePath}" alt ="${attraction.Name}"/>
            <h3>${attraction.Name}</h3>
            <p>${attraction.Description}</p>
            </div>
            `;

            container.appendChild(card);
        });
    } catch(error) {
        console.error("Error loading attractions:", error);
    }
}


// /api/top-events 
async function loadTopEvents()  {
    try{
        const response = await fetch("http://localhost:3000/api/top-events");
        const events = await response.json();

        const container = document.querySelector(".top-events-cards");
        console.log("container found:", container);

        container.innerHTML = "";

        events.forEach(event => {
            const card = document.createElement("div");
            card.classList.add("card","top-event-card");

            card.innerHTML = `
            <div>
            <img src="${event.ImagePath}" alt ="${event.Name}"/>
            <h3>${event.Name}</h3>
            <p>${event.Description}</p>
            </div>
            `;

            container.appendChild(card);
        });
    } catch(error) {
        console.error("Error loading events:", error);
    }
}


// call async functions using one DOMContentLoaded 
document.addEventListener("DOMContentLoaded", async () =>{
   console.log("Loading homepage data...");
    
    // Load all data first
    await Promise.all([
        loadTopHotels(),
        loadTopRestaurants(),
        loadTopAttractions(),
        loadTopEvents()
    ]);
    
    console.log("All data loaded! Initializing carousels...");
    
    // NOW start the carousels after data is loaded
    initializeCarousels();
})



