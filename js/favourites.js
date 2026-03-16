/**
 * favourites.js -> favourites functionality (user hearts a card on any of the pages)
 * 
 * Handles adding/removing favorites across all pages
 */

console.log("Favorites functionality initialized!");

// Get logged-in user from localStorage
function getLoggedInUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Initialize favorite buttons
function initializeFavoriteButtons() {
    document.addEventListener('click', async (e) => {
        // Check if clicked element is a favorite button
        if (e.target.classList.contains('fav-btn')) {
            e.preventDefault();
            e.stopPropagation();
            
            const user = getLoggedInUser();
            
            // Check if user is logged in
            if (!user) {
                alert('Please log in to add favourites');
                window.location.href = 'login.html';
                return;
            }

            // Get item details from button data attributes
            const itemId = e.target.getAttribute('data-id');
            const itemType = e.target.getAttribute('data-type');
            
            console.log("Favourite button clicked:", itemType, itemId);

            // Toggle favorite
            await toggleFavorite(e.target, user.id, itemType, itemId);
        }
    });
}

// Toggle favorite status
async function toggleFavorite(button, userId, itemType, itemId) {
     const isActive = button.classList.contains('active');
    
    try {
        if (isActive) {
        // Remove from favorites
            const response = await fetch('http://localhost:3000/api/favorites', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                itemType: itemType,
                itemID: parseInt(itemId)
            })
        });

        const result = await response.json();

        if (result.success) {
            button.classList.remove('active');
            button.textContent = '♡';
            console.log('Removed from favorites');
                
            // NEW: If on profile page, remove the card
            if (window.location.pathname.includes('profile.html')) {
                const card = button.closest('.card');
                if (card) {
                    card.style.transition = 'opacity 0.3s';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.remove();
                            
                    // Check if there are any cards left
                    const container = document.querySelector('#favorites-container .cards-grid');
                    const remainingCards = container.querySelectorAll('.card');
                    if (remainingCards.length === 0) {
                        container.innerHTML = '<p>No favorites yet. Start exploring and add your favorites!</p>';
                        }
                    }, 300);
                }
            }
            } else {
                alert('Failed to remove from favorites: ' + result.message);
            }
        } else {
            // Add to favorites
            const response = await fetch('http://localhost:3000/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: userId,
                    itemType: itemType,
                    itemID: parseInt(itemId)
                })
            });

            const result = await response.json();

            if (result.success) {
                button.classList.add('active');
                button.textContent = '♥';
                console.log('Added to favorites');
            } else {
                if (result.message.includes('already')) {
                    // Already favorited, just update UI
                    button.classList.add('active');
                    button.textContent = '♥';
                } else {
                    alert('Failed to add to favorites: ' + result.message);
                }
            }
        }
    } catch (error) {
        console.error('Favorite error:', error);
        alert('An error occurred while updating favorites');
    }
}

// Check and update favorite button states on page load
async function updateFavoriteStates() {
    const user = getLoggedInUser();
    if (!user) return;

    const favButtons = document.querySelectorAll('.fav-btn');
    
    for (const button of favButtons) {
        const itemId = button.getAttribute('data-id');
        const itemType = button.getAttribute('data-type');
        
        try {
            const response = await fetch(
                `http://localhost:3000/api/favorites/check/${user.id}/${itemType}/${itemId}`
            );
            const result = await response.json();
            
            if (result.success && result.isFavorited) {
                button.classList.add('active');
                button.textContent = '♥';
            }
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    }
}

// Make updateFavoriteStates globally accessible for use after filtering
window.updateFavoriteStates = updateFavoriteStates;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeFavoriteButtons();
    // Update favorite states after a short delay to let cards load
    setTimeout(updateFavoriteStates, 500);
});