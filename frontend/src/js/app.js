// Global configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'block';
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
}

function showContent(elementId) {
    const element = document.getElementById(elementId);
    if (element) element.style.display = 'block';
}

function showError(message) {
    hideLoading();
    const main = document.getElementById('main-content');
    if (main) {
        main.innerHTML = `<p class="error">Error: ${message}</p>`;
    }
}

// API calls
async function fetchLatestPost() {
    const response = await fetch(`${API_BASE_URL}/posts/latest`);
    if (!response.ok) throw new Error('Failed to fetch latest post');
    return await response.json();
}

async function fetchPostBySlug(slug) {
    const response = await fetch(`${API_BASE_URL}/posts/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch post');
    return await response.json();
}

async function fetchAllPosts() {
    const response = await fetch(`${API_BASE_URL}/posts`);
    if (!response.ok) throw new Error('Failed to fetch posts');
    return await response.json();
}

async function fetchPreviousPost(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/previous/${postId}`);
    if (!response.ok) return null;
    return await response.json();
}

async function fetchNextPost(postId) {
    const response = await fetch(`${API_BASE_URL}/posts/next/${postId}`);
    if (!response.ok) return null;
    return await response.json();
}

async function searchPosts(query) {
    const response = await fetch(`${API_BASE_URL}/posts/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search posts');
    return await response.json();
}

// Admin API calls
async function createPost(postData, username, password) {
    const auth = btoa(`${username}:${password}`);
    const response = await fetch(`${API_BASE_URL}/admin/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(postData)
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to create post');
    }
    
    return await response.json();
}

async function uploadVideo(file, username, password) {
    const formData = new FormData();
    formData.append('file', file);
    
    const auth = btoa(`${username}:${password}`);
    const response = await fetch(`${API_BASE_URL}/admin/upload-video`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`
        },
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload video');
    }
    
    return await response.json();
}

async function uploadThumbnail(file, username, password) {
    const formData = new FormData();
    formData.append('file', file);
    
    const auth = btoa(`${username}:${password}`);
    const response = await fetch(`${API_BASE_URL}/admin/upload-thumbnail`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`
        },
        body: formData
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload thumbnail');
    }
    
    return await response.json();
}
