// Filters and categories related functions
async function loadCategoryFilter() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const container = document.getElementById('categoryFilter');
        
        // Add "All Categories" button
        const allCatBtn = document.createElement('button');
        allCatBtn.className = 'filter-btn active';
        allCatBtn.innerHTML = '<i class="fas fa-layer-group"></i> All Categories';
        allCatBtn.onclick = () => applyFilters();
        container.appendChild(allCatBtn);
        
        categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.innerHTML = `<i class="fas fa-tag"></i> ${category.name}`;
            button.onclick = () => {
                // Remove active class from all buttons
                container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                applyFilters('', category.id);
            };
            container.appendChild(button);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
