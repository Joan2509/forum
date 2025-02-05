
async function loadPostCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const container = document.getElementById('postCategories');
        
        container.innerHTML = categories.map(category => `
            <label class="category-checkbox">
                <input type="checkbox" value="${category.id}">
                <span>${category.name}</span>
            </label>
        `).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
async function openCreatePostModal() {
    try {
        // Check authentication status
        const response = await fetch('/api/protected/api/auth/status');
        const data = await response.json();

        if (!data.authenticated) {
            handleError('Please login to create post');
            return;
        }

        // If authenticated, show modal and load categories
        document.getElementById('createPostModal').classList.add('active');
        loadPostCategories();
    } catch (error) {
        console.error('Error checking auth status:', error);
        handleError('Please login to create a post');
    }
}

function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post';
    postDiv.innerHTML = `
        <div class="post-header">
            <h3>${post.title}</h3>
            <small class="post-meta-info">Posted by ${post.username} on ${new Date(post.created_at).toLocaleString()}</small>
        </div>
        <p>${post.content}</p>
        <div class="post-footer">
            <div class="categories">
                ${post.categories ? post.categories.map(cat => 
                    `<span class="category-tag">${cat.name}</span>`
                ).join('') : ''}
            </div>
            <div class="post-actions">
                <button onclick="handleLike(${post.id}, true)" class="like-btn">
                    👍 <span>${post.likes || 0}</span>
                </button>
                <button onclick="handleLike(${post.id}, false)" class="dislike-btn">
                    👎 <span>${post.dislikes || 0}</span>
                </button>
                <button onclick="toggleComments(${post.id})" class="comment-btn">
                    💬 Comments (${(post.comments || []).length})
                </button>
            </div>
        </div>
        <div class="comments-container" id="comments-container-${post.id}" style="display: none;">
            <div class="comments-section" id="comments-${post.id}">
                ${renderComments(post.comments || [])}
            </div>
            <button onclick="showCommentForm(${post.id})" class="add-comment-btn">Add Comment</button>
            <div class="comment-form" id="comment-form-${post.id}" style="display: none;">
                <textarea placeholder="Write a comment..."></textarea>
                <button onclick="submitComment(${post.id})">Submit</button>
            </div>
        </div>
    `;
    return postDiv;
}

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


function closeCreatePostModal() {
    document.getElementById('createPostModal').classList.remove('active');
    document.getElementById('createPostForm').reset();
}

async function handleCreatePost(event) {
    event.preventDefault();

    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const selectedCategories = Array.from(document.querySelectorAll('#postCategories input:checked')).map(input => parseInt(input.value));

    try {
        const response = await fetch('/api/protected/api/posts/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content, raw_categories: selectedCategories })
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create post');
        }
        handleSuccess('Post created successfully');
        closeCreatePostModal();
        fetchPosts(); // Reload posts
    } catch (e) {
        handleError(e.message)
    }
}
