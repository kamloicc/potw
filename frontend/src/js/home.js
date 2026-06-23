// Home page - displays latest player of the week

let currentPost = null;

async function loadLatestPost() {
    try {
        showLoading();
        currentPost = await fetchLatestPost();
        displayPost(currentPost);
        await setupNavigation(currentPost.id);
        hideLoading();
        showContent('post-content');
    } catch (error) {
        console.error('Error loading latest post:', error);
        showError('Failed to load latest post');
    }
}

function displayPost(post) {
    document.getElementById('player-name').textContent = post.playerName;
    document.getElementById('post-title').textContent = post.title;
    document.getElementById('week-date').textContent = `Week of ${formatDate(post.weekDate)}`;
    document.getElementById('post-content-text').innerHTML = formatContent(post.content);
    
    // Set video source
    const videoPlayer = document.getElementById('video-player');
    if (post.videoUrl) {
        videoPlayer.src = post.videoUrl;
        videoPlayer.load();
    }
}

function formatContent(content) {
    // Convert line breaks to paragraphs
    return content.split('\n\n')
        .filter(p => p.trim())
        .map(p => `<p>${p.trim()}</p>`)
        .join('');
}

async function setupNavigation(postId) {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    
    // Check for previous post
    const previousPost = await fetchPreviousPost(postId);
    if (previousPost) {
        prevButton.disabled = false;
        prevButton.onclick = () => {
            window.location.href = `post.html?slug=${previousPost.slug}`;
        };
    } else {
        prevButton.disabled = true;
    }
    
    // Check for next post
    const nextPost = await fetchNextPost(postId);
    if (nextPost) {
        nextButton.disabled = false;
        nextButton.onclick = () => {
            window.location.href = `post.html?slug=${nextPost.slug}`;
        };
    } else {
        nextButton.disabled = true;
    }
}

// Load latest post on page load
window.addEventListener('DOMContentLoaded', loadLatestPost);
