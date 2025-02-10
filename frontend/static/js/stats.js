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
                <div class="stat-item likes">
                    <div class="stat-icon likes">
                        <i class="fas fa-thumbs-up"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value" data-value="${stats.total_likes}">0</span>
                        <span class="stat-label">Total Likes</span>
                    </div>
                </div>
                <div class="stat-item comments">
                    <div class="stat-icon comments">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value" data-value="${stats.total_comments}">0</span>
                        <span class="stat-label">Total Comments</span>
                    </div>
                </div>
                <div class="stat-item posts">
                    <div class="stat-icon posts">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-details">
                        <span class="stat-value" data-value="${stats.total_posts}">0</span>
                        <span class="stat-label">Total Posts</span>
                    </div>
                </div>
                <div class="stat-category">
                    <h4>Trending Category</h4>
                    <div class="category-stat">
                        <span class="category-name">${stats.most_active_category} </span>
                        <span class="category-count">${stats.category_post_count} posts</span>
                    </div>
                </div>
            </div>
        `;

        // Animate the numbers
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(statValue => {
            const targetValue = parseInt(statValue.dataset.value);
            animateValue(statValue, 0, targetValue, 1500);
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const currentValue = Math.floor(progress * (end - start) + start);
        element.textContent = currentValue.toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Update stats every 30 seconds
setInterval(fetchAndDisplayStats, 30000);

// Initial load
document.addEventListener('DOMContentLoaded', fetchAndDisplayStats); 