/**
 * =====================================================
 * Home Page JavaScript
 * Handles food grid loading and homepage interactions
 * =====================================================
 */

// Thai food data for display
const thaiFoods = [
    { name: 'Pad Thai', nameTh: 'ผัดไทย', image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400', category: 'Noodles' },
    { name: 'Tom Yum Goong', nameTh: 'ต้มยำกุ้ง', image: 'https://images.unsplash.com/photo-1548943487-2fc224cf1246?w=400', category: 'Soup' },
    { name: 'Green Curry', nameTh: 'แกงเขียวหวาน', image: 'https://images.unsplash.com/photo-1626804475297-411dbe6314f3?w=400', category: 'Curry' },
    { name: 'Massaman Curry', nameTh: 'แกงมัสมั่น', image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', category: 'Curry' },
    { name: 'Som Tum', nameTh: 'ส้มตำ', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400', category: 'Salad' },
    { name: 'Mango Sticky Rice', nameTh: 'ข้าวเหนียวมะม่วง', image: 'https://images.unsplash.com/photo-1596796673682-151ac6c3e7cf?w=400', category: 'Dessert' },
    { name: 'Pad Krapow Moo', nameTh: 'ผัดกระเพราหมู', image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400', category: 'Stir Fry' },
    { name: 'Pad See Ew', nameTh: 'ผัดซีอิ๊ว', image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', category: 'Noodles' }
];

// Load food grid
function loadFoodGrid() {
    const grid = document.getElementById('foodGrid');
    if (!grid) return;

    grid.innerHTML = thaiFoods.map(food => `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="food-item">
                <img src="${food.image}" alt="${food.name}" loading="lazy"
                     onerror="this.src='https://via.placeholder.com/400x300?text=${encodeURIComponent(food.name)}'">
                <div class="food-item-content">
                    <h6 class="fw-bold mb-1">${food.name}</h6>
                    <p class="text-muted small mb-0">${food.nameTh}</p>
                    <span class="badge bg-secondary mt-2">${food.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Load foods from API (if available)
async function loadFoodsFromAPI() {
    try {
        const response = await API.get('/foods');
        if (response.success && response.data.foods) {
            // Use API data if available
            console.log('Foods loaded from API:', response.data.foods.length);
        }
    } catch (error) {
        console.log('Using default food data');
    }
}

// Initialize home page
document.addEventListener('DOMContentLoaded', () => {
    loadFoodGrid();
    loadFoodsFromAPI();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
