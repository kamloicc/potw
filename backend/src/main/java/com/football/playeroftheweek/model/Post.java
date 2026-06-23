package com.football.playeroftheweek.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "posts")
public class Post {
    
    @Id
    private String id;
    
    private String playerName;
    
    private String title;
    
    @Indexed(unique = true)
    private String slug;
    
    private String content;
    
    private String videoObjectKey;
    
    private String thumbnailObjectKey;
    
    @Indexed
    private LocalDate weekDate;
    
    private boolean featured;
    
    @CreatedDate
    private Instant createdAt;
    
    private List<String> tags;
}
