// Debugging line- checking if the connection was made correctly 
// console.log("main.js is loaded");

// main.js -> handles universal navigationa nd utilities

//using the FETCH API calls from server.js 

/**
 * ----------------------------
 * 1. CAROUSEL AUTO SCORLL 
 * ---------------------------
 */
/** It loops through each carousel, moves it a tiny bit every frame , 
 * and resets it to the start when it reaches the end. Hovering the 
 * mouse over any of the carousels pauses it using a boolean flag.
 */
function initializeCarousels() {
    const carousels = document.querySelectorAll(".carousel .cards");
    // safe exit if the page does not require this functionality 
    if(!carousels.length) return;
    console.log("Found", carousels.length, "carousels to initialize");

    carousels.forEach((cards, index) => {
        // Skip if carousel has no cards
        if (cards.children.length === 0) {
            console.warn(` Carousel ${index} has no cards, skipping`);
            return;
        }

        let scrollSpeed = 0.5;  // Reduced speed for smoother motion
        let isPaused = false;
        let scrollInterval;

        // Clone cards for an infinite scroll effect
        const cloneCards = () => {
            const cardElements = Array.from(cards.children);
            cardElements.forEach(card => {
                const clone = card.cloneNode(true);
                cards.appendChild(clone);
            });
        };

        // Clone the cards once for an ideal loop
        cloneCards();

        // Scroll function
        const startScrolling = () => {
            scrollInterval = setInterval(() => {
                if (!isPaused && cards.scrollWidth > cards.clientWidth) {
                    cards.scrollLeft += scrollSpeed;

                    // Reset to start when halfway through
                    if (cards.scrollLeft >= cards.scrollWidth / 2) {
                        cards.scrollLeft = 0;
                    }
                }
            }, 16); // ~60fps for smoother animation
        };

        // when mouse enters pause the carousel
        cards.addEventListener("mouseenter", () => {
            isPaused = true;
        });
        // when mouse leaves continue the carousel
        cards.addEventListener("mouseleave", () => {
            isPaused = false;
        });

        // Start scrolling
        startScrolling();
        console.log(` Carousel ${index} initialized with ${cards.children.length} cards`);
    });
}


/**
 * -----------------------------
 * 2. HAMBURGER MENU TOGGLE
 * -----------------------------
 */
/** When the hamburger icon is clicked on, it toggles the class active on 
 * both the icon and the mobile navigation menu, which will either show or 
 * hide the dropdwon menu on mobile.
 */
document.addEventListener("DOMContentLoaded", function(){
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.querySelector(".mobile-nav");

    // attach the listener only if the above elements exist 
    // safe guards pages that dont require this functionality 
    if(hamburger && mobileNav){
        hamburger.addEventListener("click", function() {
        mobileNav.classList.toggle("show");
        hamburger.classList.toggle("active");
        });
    }
    
});

/**
 * ---------------------------
 * 3. SMOOTH SCROLLING 
 * ---------------------------
 */
/** This allows in-page links to scroll smoothly to a section instead of jumping instantly. Gets rid of the jittery
 * feeling when scrolling.
 */

document.querySelectorAll('a[href^="#"]').forEach(anchor =>{
    anchor.addEventListener('click', function(e){
        e.preventDefault(); // Stops the default jump behaviour

        // get the target section e.g "#hotels" -> section id="hotels"
        const target = document.querySelector(this.getAttribute('href'));
        
        // If the target exists, scroll to it smoothly
        if(target){
            target.scrollIntoView({
                behavior: 'smooth',  // makes it glide
                block: 'start'      // alighs to top of viewport
            });
        }
    });
});


