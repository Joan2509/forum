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