async function fetchPosts() {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch posts');
        }
        const posts = await response.json();
        const postsList = document.getElementById('posts-list');

        if (postsList.length === 0) {
            postsList.innerHTML = '<p>No posts yet. Be the first to create one!</p>';
            return;
        }

        postsList.innerHTML = '';
        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsList.appendChild(postElement)
        });
    } catch (error) {
        console.error('Error fetching posts', error);
        document.getElementById('posts-list').innerHTML = `<p>Error loading posts: ${error.message}</p>`;
    }
}

async function openCreatePostModal() {
    try {
        // Check authentication status
        const response = await fetch('/api/protected/auth/status');
        const data = await response.json();

        if (!data.authenticated) {
            handleError('Please login to create post');
            return;
        }

        // If authenticated, show modal and load categories
        document.getElementById('createPostModal').classList.add('active');
        loadCategories();
    } catch (error) {
        console.error('Error checking auth status:', error);
        handleError('Please login to create a post');
    }
}