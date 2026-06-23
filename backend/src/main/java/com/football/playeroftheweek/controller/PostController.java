package com.football.playeroftheweek.controller;

import com.football.playeroftheweek.model.Post;
import com.football.playeroftheweek.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PostController {
    
    private final PostService postService;
    
    @GetMapping("/latest")
    public ResponseEntity<Map<String, Object>> getLatestPost() {
        return postService.getLatestPost()
                .map(post -> {
                    Map<String, Object> response = buildPostResponse(post);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
        List<Post> posts = postService.getAllPosts();
        List<Map<String, Object>> response = posts.stream()
                .map(this::buildPostResponse)
                .toList();
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{slug}")
    public ResponseEntity<Map<String, Object>> getPostBySlug(@PathVariable String slug) {
        return postService.getPostBySlug(slug)
                .map(post -> {
                    Map<String, Object> response = buildPostResponse(post);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/previous/{id}")
    public ResponseEntity<Map<String, Object>> getPreviousPost(@PathVariable String id) {
        return postService.getPreviousPost(id)
                .map(post -> {
                    Map<String, Object> response = buildPostResponse(post);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/next/{id}")
    public ResponseEntity<Map<String, Object>> getNextPost(@PathVariable String id) {
        return postService.getNextPost(id)
                .map(post -> {
                    Map<String, Object> response = buildPostResponse(post);
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchPosts(@RequestParam String query) {
        List<Post> posts = postService.searchPosts(query);
        List<Map<String, Object>> response = posts.stream()
                .map(this::buildPostResponse)
                .toList();
        return ResponseEntity.ok(response);
    }
    
    private Map<String, Object> buildPostResponse(Post post) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", post.getId());
        response.put("playerName", post.getPlayerName());
        response.put("title", post.getTitle());
        response.put("slug", post.getSlug());
        response.put("content", post.getContent());
        response.put("weekDate", post.getWeekDate());
        response.put("featured", post.isFeatured());
        response.put("createdAt", post.getCreatedAt());
        response.put("tags", post.getTags());
        
        // Generate presigned URLs for video and thumbnail
        if (post.getVideoObjectKey() != null) {
            String videoUrl = postService.getVideoUrl(post.getVideoObjectKey());
            response.put("videoUrl", videoUrl);
        }
        
        if (post.getThumbnailObjectKey() != null) {
            String thumbnailUrl = postService.getThumbnailUrl(post.getThumbnailObjectKey());
            response.put("thumbnailUrl", thumbnailUrl);
        }
        
        return response;
    }
}
