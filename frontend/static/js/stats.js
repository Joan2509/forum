async function fetchAndDisplayStats() {
    try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        const stats = await response.json();
        
        const trendingSection = document.querySelector('.trending-section');
        trendingSection.innerHTML = `
            <h3>Quick Forum Stats</h3>
            <div class="stats-container">
                <div class="stat-item">
                    <div class="stat-icon likes">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${stats.total_likes}</span>
                        <span class="stat-label">Total Likes</span>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon comments">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${stats.total_comments}</span>
                        <span class="stat-label">Comments</span>
                    </div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon posts">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value">${stats.total_posts}</span>
                        <span class="stat-label">Posts</span>
                    </div>
                </div>
                <div class="stat-category">
                    <h4>Most Active Category</h4>
                    <div class="category-stat">
                        <span class="category-name">${stats.most_active_category}</span>
                        <span class="category-count">${stats.category_post_count} posts</span>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Update stats every 30 seconds
setInterval(fetchAndDisplayStats, 30000);

// Initial load
document.addEventListener('DOMContentLoaded', fetchAndDisplayStats); 