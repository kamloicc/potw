// Archive page - list all posts

let allPosts = [];

async function loadArchive() {
    try {
        showLoading();
        allPosts = await fetchAllPosts();
        displayArchive(allPosts);
        hideLoading();
        showContent('archive-list');
    } catch (error) {
        console.error('Error loading archive:', error);
        showError('Failed to load archive');
    }
}

function displayArchive(posts) {
    const archiveList = document.getElementById('archive-list');
    
    if (posts.length === 0) {
        archiveList.innerHTML = '<p>No posts available yet.</p>';
        return;
    }
    
    archiveList.innerHTML = posts.map(post => `
        <div class="archive-item">
            <a href="post.html?slug=${post.slug}">
                <span class="player-name">${post.playerName}</span>
                <span class="week-date">— ${formatDate(post.weekDate)}</span>
            </a>
        </div>
    `).join('');
}

// Search functionality
const searchInput = document.getElementById('search-input');
let searchTimeout;

searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (!query) {
        displayArchive(allPosts);
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const results = await searchPosts(query);
            displayArchive(results);
        } catch (error) {
            console.error('Error searching posts:', error);
        }
    }, 300);
});

// Load archive on page load
window.addEventListener('DOMContentLoaded', loadArchive);
