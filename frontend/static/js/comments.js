// Comments related functions
function renderComments(comments) {
    if (!Array.isArray(comments) || comments.length === 0) {
        return '<p class="no-comments">No comments yet</p>';
    }
    
    return comments.map(comment => `
        <div class="comment">
            <p>${comment.content}</p>
            <div class="comment-footer">
                <small>By ${comment.username} on ${new Date(comment.created_at).toLocaleString()}</small>
                <div class="comment-actions">
                    <button onclick="handleCommentLike(${comment.id}, true)" class="action-btn">
                        👍 <span>${comment.likes || 0}</span>
                    </button>
                    <button onclick="handleCommentLike(${comment.id}, false)" class="action-btn">
                        👎 <span>${comment.dislikes || 0}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}
function toggleComments(postId) {
    const container = document.getElementById(`comments-container-${postId}`);
    if (container.style.display === 'none') {
        container.style.display = 'block';
        openCommentSections.add(postId);
    } else {
        container.style.display = 'none';
        openCommentSections.delete(postId);
    }
}
function showCommentForm(postId) {
    const commentsContainer = document.getElementById(`comments-container-${postId}`);
    const form = document.getElementById(`comment-form-${postId}`);
    commentsContainer.style.display = 'block';
    form.style.display = 'block';
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
        // First check authentication status
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

        // Wait for the response before clearing the form
        await response.json();
        
        textarea.value = '';
        commentForm.style.display = 'none';
        
        // Fetch the updated post data
        await fetchPosts();
        handleSuccess('Comment posted successfully');
    } catch (error) {
        console.error('Error submitting comment:', error);
        handleError('Failed to post comment');
    }
}
async function handleCommentLike(commentId, isLike) {
    try {
        // Check authentication first
        const authResponse = await fetch('/api/protected/api/auth/status');
        const authData = await authResponse.json();
        
        if (!authData.authenticated) {
            handleError('Please login to like comments');
            return;
        }

        const response = await fetch('/api/protected/api/comments/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comment_id: commentId,
                is_like: isLike,
                user_id: authData.user_id
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update like');
        }
        
        await fetchPosts();
        handleSuccess(isLike ? 'Comment liked!' : 'Comment disliked!');
    } catch (error) {
        console.error('Error handling comment like:', error);
        handleError('Failed to update like');
    }
} 