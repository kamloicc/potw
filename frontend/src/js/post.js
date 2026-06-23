// Single post page

let currentPost = null;

async function loadPost() {
    try {
        showLoading();
        
        // Get slug from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        
        if (!slug) {
            showError('No post specified');
            return;
        }
        
        currentPost = await fetchPostBySlug(slug);
        displayPost(currentPost);
        await setupNavigation(currentPost.id);
        hideLoading();
        showContent('post-content');
    } catch (error) {
        console.error('Error loading post:', error);
        showError('Failed to load post');
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
    
    // Update page title
    document.title = `${post.playerName} - Player of the Week`;
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

// Load post on page load
window.addEventListener('DOMContentLoaded', loadPost);
