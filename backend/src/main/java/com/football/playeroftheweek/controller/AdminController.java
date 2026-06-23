package com.football.playeroftheweek.controller;

import com.football.playeroftheweek.model.Post;
import com.football.playeroftheweek.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {
    
    private final PostService postService;
    
    @PostMapping("/posts")
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        log.info("Creating new post: {}", post.getTitle());
        Post createdPost = postService.createPost(post);
        return ResponseEntity.ok(createdPost);
    }
    
    @PutMapping("/posts/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post post) {
        log.info("Updating post: {}", id);
        Post updatedPost = postService.updatePost(id, post);
        return ResponseEntity.ok(updatedPost);
    }
    
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        log.info("Deleting post: {}", id);
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
    
    @PostMapping("/upload-video")
    public ResponseEntity<Map<String, String>> uploadVideo(@RequestParam("file") MultipartFile file) {
        log.info("Uploading video: {}", file.getOriginalFilename());
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        
        try {
            String objectKey = postService.uploadVideo(file);
            Map<String, String> response = new HashMap<>();
            response.put("objectKey", objectKey);
            response.put("message", "Video uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading video", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload video: " + e.getMessage()));
        }
    }
    
    @PostMapping("/upload-thumbnail")
    public ResponseEntity<Map<String, String>> uploadThumbnail(@RequestParam("file") MultipartFile file) {
        log.info("Uploading thumbnail: {}", file.getOriginalFilename());
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }
        
        try {
            String objectKey = postService.uploadThumbnail(file);
            Map<String, String> response = new HashMap<>();
            response.put("objectKey", objectKey);
            response.put("message", "Thumbnail uploaded successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading thumbnail", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload thumbnail: " + e.getMessage()));
        }
    }
}
