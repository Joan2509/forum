// Filters and categories related functions
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