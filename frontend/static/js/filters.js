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
async function applyFilters(filterType = '', categoryId = '') {
    try {
        let url = '/api/posts';
        
        // Use protected endpoint for user-specific filters
        if (filterType === 'my-posts' || filterType === 'liked-posts') {
            url = '/api/protected/api/posts';
        }
        
        // Add query parameters
        if (categoryId || filterType) {
            url += '?';
            if (categoryId) url += `category=${categoryId}`;
            if (filterType) {
                if (categoryId) url += '&';
                url += `filter=${filterType}`;
            }
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch filtered posts');
        }
        
        const posts = await response.json();
        const postsList = document.getElementById('posts-list');
        
        if (!posts || posts.length === 0) {
            postsList.innerHTML = '<p>No posts found</p>';
            return;
        }

        postsList.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsList.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error applying filters:', error);
        if (error.message.includes('Failed to fetch')) {
            handleError('Please login to view filtered posts');
        }
    }
} 