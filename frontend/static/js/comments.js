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