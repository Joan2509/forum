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

        textarea.value = '';
        // commentForm.style.display = 'none';
        openCommentSections.add(postId);
        fetchPosts();
    } catch (error) {
        console.error('Error submitting comment:', error);
        handleError('Please login to comment');
    }
}
async function handleCommentLike(commentId, isLike) {
    try {
        const response = await fetch('/api/protected/api/comments/likes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comment_id: commentId,
                is_like: isLike
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update like');
        }
        
        await fetchPosts();
    } catch (error) {
        console.error('Error handling comment like:', error);
        handleError('Please login to like comments');
    }
} 