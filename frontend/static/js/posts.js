let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;
let currentFilter = '';

async function loadPostCategories() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        const container = document.getElementById('categoryFilter');
        
        container.innerHTML = categories.map(category => `
            <button 
                onclick="applyCategoryFilter('${category.id}')" 
                class="category-filter-btn"
                data-category="${category.id}">
                ${category.name}
            </button>
        `).join('') + `
            <button 
                onclick="applyCategoryFilter('')" 
                class="category-filter-btn">
                All Categories
            </button>
        `;
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
    postDiv.dataset.postId = post.id;
    
    // Truncate content if it's longer than 800 characters
    const isLongPost = post.content.length > 800;
    const truncatedContent = isLongPost ? post.content.slice(0, 800) + '...' : post.content;
    
    postDiv.innerHTML = `
        <div class="post-header">
            <h3>${post.title}</h3>
            <small class="post-meta-info">Posted by ${post.username} on ${new Date(post.created_at).toLocaleString()}</small>
        </div>
        <div class="post-content">
            <p>${truncatedContent}</p>
            ${isLongPost ? `
                <div class="read-more-section">
                    <button onclick="toggleFullPost(this, \`${encodeURIComponent(post.content)}\`)" class="read-more-btn">
                        Read More
                    </button>
                </div>
            ` : ''}
        </div>
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

function toggleFullPost(button, content) {
    const decodedContent = decodeURIComponent(content);
    const postContent = button.closest('.post-content');
    const paragraph = postContent.querySelector('p');
    
    if (button.textContent === 'Read More') {
        paragraph.textContent = decodedContent;
        button.textContent = 'Show Less';
    } else {
        paragraph.textContent = decodedContent.slice(0, 800) + '...';
        button.textContent = 'Read More';
        // Scroll back to the top of the post
        button.closest('.post').scrollIntoView({ behavior: 'smooth' });
    }
}

async function fetchPosts(append = false) {
    if (isLoading || (!append && !hasMorePosts)) return;
    
    try {
        isLoading = true;
        const response = await fetch(`/api/posts?page=${currentPage}&filter=${currentFilter}`);
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
            throw new Error('Login to leave a like');
        }

        await updatePost(postId);
        handleSuccess(isLike ? 'Post liked!' : 'Post disliked!');
    } catch (error) {
        console.error('Error handling like:', error);
        handleError('Login to like posts');
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
    currentFilter = '';
    hasMorePosts = true;
    fetchPosts(false);
}

// Called when the page loads
document.addEventListener('DOMContentLoaded', () => {
    resetPosts();
    setupInfiniteScroll();
    loadPostCategories();
});

// Update other functions that fetch posts to use resetPosts()
function applyFilters(filter) {
    currentFilter = filter || '';
    currentPage = 1;
    hasMorePosts = true;
    fetchPosts(false);
}

async function submitComment(postId) {
    const commentForm = document.getElementById(`comment-form-${postId}`);
    const textarea = commentForm.querySelector('textarea');
    const content = textarea.value.trim();

    if (!content) {
        handleError('Comment cannot be empty');
        return;
    }

    try {
        const authResponse = await fetch('/api/protected/api/auth/status');
        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            handleError('Please login to comment');
            return;
        }

        const response = await fetch('/api/protected/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                post_id: postId,
                content: content
            })
        });

        if (!response.ok) {
            throw new Error('Failed to submit comment');
        }

        await response.json();
        textarea.value = '';
        commentForm.style.display = 'none';
        
        await updatePost(postId);
        handleSuccess('Comment posted successfully');
    } catch (error) {
        console.error('Error submitting comment:', error);
        handleError('Login to post comment');
    }
}

async function updatePost(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch updated post');
        }
        const updatedPost = await response.json();
        
        // Find and update the specific post in the DOM
        const existingPost = document.querySelector(`.post[data-post-id="${postId}"]`);
        if (existingPost) {
            const newPost = createPostElement(updatedPost);
            // Preserve the comments display state
            const oldCommentsContainer = existingPost.querySelector('.comments-container');
            const newCommentsContainer = newPost.querySelector('.comments-container');
            if (oldCommentsContainer && oldCommentsContainer.style.display === 'block') {
                newCommentsContainer.style.display = 'block';
            }
            existingPost.replaceWith(newPost);
        }
    } catch (error) {
        console.error('Error updating post:', error);
    }
}

// Add this function to handle category filtering
function applyCategoryFilter(categoryId) {
    if (categoryId === '') {
        currentFilter = '';
    } else {
        currentFilter = `category-${categoryId}`;
    }
    currentPage = 1;
    hasMorePosts = true;
    fetchPosts(false);
}
