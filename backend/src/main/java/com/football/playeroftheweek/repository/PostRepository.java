package com.football.playeroftheweek.repository;

import com.football.playeroftheweek.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    
    Optional<Post> findBySlug(String slug);
    
    Optional<Post> findFirstByOrderByWeekDateDesc();
    
    List<Post> findAllByOrderByWeekDateDesc();
    
    @Query("{ 'playerName': { $regex: ?0, $options: 'i' } }")
    List<Post> searchByPlayerName(String query);
    
    @Query("{ 'weekDate': { $lt: ?0 } }")
    Optional<Post> findPreviousPost(LocalDate weekDate);
    
    @Query("{ 'weekDate': { $gt: ?0 } }")
    Optional<Post> findNextPost(LocalDate weekDate);
    
    boolean existsBySlug(String slug);
}
