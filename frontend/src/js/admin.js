// Admin page - create new posts

let videoObjectKey = null;
let thumbnailObjectKey = null;
let adminCredentials = null; // Store credentials after login

const loginForm = document.getElementById('login-form');
const loginSection = document.getElementById('login-section');
const postSection = document.getElementById('post-section');
const loginMessage = document.getElementById('login-message');
const logoutButton = document.getElementById('logout-button');
const form = document.getElementById('post-form');
const messageDiv = document.getElementById('message');

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    loginMessage.textContent = 'Verifying credentials...';
    loginMessage.className = '';
    
    // Test credentials by making a simple API call
    try {
        const auth = btoa(`${username}:${password}`);
        const response = await fetch('http://localhost:8080/api/posts/latest', {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        
        // If we get here without error, credentials work
        adminCredentials = { username, password };
        loginMessage.textContent = '✓ Login successful!';
        loginMessage.className = 'success';
        
        // Show post section, hide login
        setTimeout(() => {
            loginSection.style.display = 'none';
            postSection.style.display = 'block';
        }, 500);
        
    } catch (error) {
        loginMessage.textContent = 'Invalid credentials. Please try again.';
        loginMessage.className = 'error';
    }
});

// Logout handler
logoutButton.addEventListener('click', () => {
    adminCredentials = null;
    videoObjectKey = null;
    thumbnailObjectKey = null;
    form.reset();
    loginForm.reset();
    document.getElementById('video-upload-status').textContent = '';
    document.getElementById('thumbnail-upload-status').textContent = '';
    loginSection.style.display = 'block';
    postSection.style.display = 'none';
    loginMessage.textContent = '';
});

// Auto-generate slug from title
document.getElementById('title').addEventListener('input', (e) => {
    const slug = e.target.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    document.getElementById('slug').value = slug;
});

// Video upload
document.getElementById('video-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const statusEl = document.getElementById('video-upload-status');
    statusEl.textContent = 'Uploading video...';
    statusEl.className = '';
    
    try {
        const result = await uploadVideo(file, adminCredentials.username, adminCredentials.password);
        videoObjectKey = result.objectKey;
        statusEl.textContent = '✓ Video uploaded successfully';
        statusEl.className = 'success';
    } catch (error) {
        console.error('Error uploading video:', error);
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.className = 'error';
        videoObjectKey = null;
    }
});

// Thumbnail upload
document.getElementById('thumbnail-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const statusEl = document.getElementById('thumbnail-upload-status');
    statusEl.textContent = 'Uploading thumbnail...';
    statusEl.className = '';
    
    try {
        const result = await uploadThumbnail(file, adminCredentials.username, adminCredentials.password);
        thumbnailObjectKey = result.objectKey;
        statusEl.textContent = '✓ Thumbnail uploaded successfully';
        statusEl.className = 'success';
    } catch (error) {
        console.error('Error uploading thumbnail:', error);
        statusEl.textContent = `Error: ${error.message}`;
        statusEl.className = 'error';
        thumbnailObjectKey = null;
    }
});

// Form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!videoObjectKey) {
        showMessage('Please upload a video first', 'error');
        return;
    }
    
    const tags = document.getElementById('tags').value
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    const postData = {
        playerName: document.getElementById('player-name').value,
        title: document.getElementById('title').value,
        slug: document.getElementById('slug').value,
        content: document.getElementById('content').value,
        videoObjectKey: videoObjectKey,
        thumbnailObjectKey: thumbnailObjectKey,
        weekDate: document.getElementById('week-date').value,
        featured: document.getElementById('featured').checked,
        tags: tags
    };
    
    try {
        showMessage('Creating post...', '');
        await createPost(postData, adminCredentials.username, adminCredentials.password);
        showMessage('✓ Post created successfully!', 'success');
        
        // Reset form
        setTimeout(() => {
            form.reset();
            videoObjectKey = null;
            thumbnailObjectKey = null;
            document.getElementById('video-upload-status').textContent = '';
            document.getElementById('thumbnail-upload-status').textContent = '';
        }, 2000);
        
    } catch (error) {
        console.error('Error creating post:', error);
        showMessage(`Error: ${error.message}`, 'error');
    }
});

function showMessage(text, className) {
    messageDiv.textContent = text;
    messageDiv.className = className;
}
