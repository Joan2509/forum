let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;

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

async function fetchPosts(append = false) {
    if (isLoading || (!append && !hasMorePosts)) return;
    
    try {
        isLoading = true;
        const response = await fetch(`/api/posts?page=${currentPage}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch posts');
        }
        const posts = await response.json();
        
        // Check if we've reached the end
        if (posts.length < 8) {
            hasMorePosts = false;
        }

        const postsList = document.getElementById('posts-list');
        
        if (!append) {
            postsList.innerHTML = '';
        }

        if (!posts || posts.length === 0) {
            if (!append) {
                postsList.innerHTML = '<p>No posts yet. Be the first to create one!</p>';
            }
            hasMorePosts = false;
            return;
        }

        posts.forEach(post => {
            const postElement = createPostElement(post);
            postsList.appendChild(postElement);
        });

        // Re-setup infinite scroll after adding new posts
        setupInfiniteScroll();

    } catch (error) {
        console.error('Error fetching posts:', error);
        handleError('Error loading posts: ' + error.message);
    } finally {
        isLoading = false;
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
        resetPosts();
    } catch (e) {
        handleError(e.message)
    }
}

async function handleLike(postId, isLike) {
    try {
        // Check authentication first
        const authResponse = await fetch('/api/protected/api/auth/status');
        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            handleError('Please login to like posts');
            return;
        }

        const response = await fetch('/api/protected/api/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId,
                is_like: isLike
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update like');
        }

        await fetchPosts();
        handleSuccess(isLike ? 'Post liked!' : 'Post disliked!');
    } catch (error) {
        console.error('Error handling like:', error);
        handleError('Failed to update like');
    }
}

function setupInfiniteScroll() {
    // Remove any existing trigger
    const existingTrigger = document.getElementById('load-more-trigger');
    if (existingTrigger) {
        existingTrigger.remove();
    }

    const loadMoreTrigger = document.createElement('div');
    loadMoreTrigger.id = 'load-more-trigger';
    loadMoreTrigger.innerHTML = `
        <div class="loading-spinner" style="display: none;"></div>
        <button class="load-more-btn" onclick="loadMorePosts()">Load More</button>
    `;
    document.getElementById('posts-list').appendChild(loadMoreTrigger);

    // Set up intersection observer for infinite scroll
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !isLoading) {
            loadMorePosts();
        }
    }, { threshold: 0.1 });

    observer.observe(loadMoreTrigger);
}

async function loadMorePosts() {
    if (isLoading || !hasMorePosts) return;
    
    const trigger = document.getElementById('load-more-trigger');
    const spinner = trigger.querySelector('.loading-spinner');
    const button = trigger.querySelector('.load-more-btn');
    
    spinner.style.display = 'inline-block';
    button.style.display = 'none';
    
    currentPage++;
    await fetchPosts(true);
    
    spinner.style.display = 'none';
    button.style.display = hasMorePosts ? 'inline-block' : 'none';
    
    if (!hasMorePosts) {
        trigger.innerHTML = '<p>No more posts to load</p>';
    }
}

// Update the existing functions
function resetPosts() {
    currentPage = 1;
    hasMorePosts = true;
    fetchPosts(false);
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', () => {
    resetPosts();
    setupInfiniteScroll();
});

// Update other functions that fetch posts to use resetPosts()
function applyFilters(filter) {
    resetPosts();
}
