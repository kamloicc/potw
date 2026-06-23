package com.football.playeroftheweek.service;

import com.football.playeroftheweek.model.Post;
import com.football.playeroftheweek.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {
    
    private final PostRepository postRepository;
    private final MinioService minioService;
    
    @Cacheable(value = "latestPost")
    public Optional<Post> getLatestPost() {
        return postRepository.findFirstByOrderByWeekDateDesc();
    }
    
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByWeekDateDesc();
    }
    
    public Optional<Post> getPostBySlug(String slug) {
        return postRepository.findBySlug(slug);
    }
    
    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }
    
    public Optional<Post> getPreviousPost(String currentPostId) {
        Optional<Post> currentPost = postRepository.findById(currentPostId);
        if (currentPost.isEmpty()) {
            return Optional.empty();
        }
        
        LocalDate currentDate = currentPost.get().getWeekDate();
        return postRepository.findPreviousPost(currentDate);
    }
    
    public Optional<Post> getNextPost(String currentPostId) {
        Optional<Post> currentPost = postRepository.findById(currentPostId);
        if (currentPost.isEmpty()) {
            return Optional.empty();
        }
        
        LocalDate currentDate = currentPost.get().getWeekDate();
        return postRepository.findNextPost(currentDate);
    }
    
    public List<Post> searchPosts(String query) {
        return postRepository.searchByPlayerName(query);
    }
    
    @Transactional
    @CacheEvict(value = "latestPost", allEntries = true)
    public Post createPost(Post post) {
        if (postRepository.existsBySlug(post.getSlug())) {
            throw new IllegalArgumentException("Post with slug already exists: " + post.getSlug());
        }
        
        log.info("Creating new post: {}", post.getTitle());
        return postRepository.save(post);
    }
    
    @Transactional
    @CacheEvict(value = "latestPost", allEntries = true)
    public Post updatePost(String id, Post updatedPost) {
        Post existingPost = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));
        
        // Check if slug is being changed and if new slug already exists
        if (!existingPost.getSlug().equals(updatedPost.getSlug()) 
                && postRepository.existsBySlug(updatedPost.getSlug())) {
            throw new IllegalArgumentException("Post with slug already exists: " + updatedPost.getSlug());
        }
        
        existingPost.setPlayerName(updatedPost.getPlayerName());
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setSlug(updatedPost.getSlug());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setWeekDate(updatedPost.getWeekDate());
        existingPost.setFeatured(updatedPost.isFeatured());
        existingPost.setTags(updatedPost.getTags());
        
        // Update video/thumbnail only if provided
        if (updatedPost.getVideoObjectKey() != null) {
            existingPost.setVideoObjectKey(updatedPost.getVideoObjectKey());
        }
        if (updatedPost.getThumbnailObjectKey() != null) {
            existingPost.setThumbnailObjectKey(updatedPost.getThumbnailObjectKey());
        }
        
        log.info("Updating post: {}", id);
        return postRepository.save(existingPost);
    }
    
    @Transactional
    @CacheEvict(value = "latestPost", allEntries = true)
    public void deletePost(String id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Post not found: " + id));
        
        // Delete associated files from MinIO
        if (post.getVideoObjectKey() != null) {
            try {
                minioService.deleteFile(post.getVideoObjectKey());
            } catch (Exception e) {
                log.warn("Failed to delete video file: {}", post.getVideoObjectKey(), e);
            }
        }
        
        if (post.getThumbnailObjectKey() != null) {
            try {
                minioService.deleteFile(post.getThumbnailObjectKey());
            } catch (Exception e) {
                log.warn("Failed to delete thumbnail file: {}", post.getThumbnailObjectKey(), e);
            }
        }
        
        log.info("Deleting post: {}", id);
        postRepository.deleteById(id);
    }
    
    public String uploadVideo(MultipartFile file) {
        return minioService.uploadFile(file, "videos");
    }
    
    public String uploadThumbnail(MultipartFile file) {
        return minioService.uploadFile(file, "thumbnails");
    }
    
    public String getVideoUrl(String objectKey) {
        return minioService.getPresignedUrl(objectKey);
    }
    
    public String getThumbnailUrl(String objectKey) {
        return minioService.getPresignedUrl(objectKey);
    }
}
