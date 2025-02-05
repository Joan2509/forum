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