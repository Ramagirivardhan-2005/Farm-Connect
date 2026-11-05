package com.farmconnect.modules.posts.repository;

import com.farmconnect.modules.posts.model.Post;
import com.farmconnect.modules.posts.model.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findByPostId(String postId);

    Page<Post> findByChannelIdAndStatusOrderByCreatedAtDesc(Long channelId, PostStatus status, Pageable pageable);

    Page<Post> findByStatusOrderByCreatedAtDesc(PostStatus status, Pageable pageable);

    List<Post> findByChannelId(Long channelId);

    // Anti-duplicate protection: check if same farmer posted substantially identical content recently
    @Query("SELECT p FROM Post p WHERE p.farmer.id = :farmerId AND p.title = :title AND p.createdAt >= :threshold ORDER BY p.createdAt DESC")
    List<Post> findRecentSimilarPosts(
            @Param("farmerId") Long farmerId,
            @Param("title") String title,
            @Param("threshold") Instant threshold);

    @Query("SELECT p FROM Post p WHERE p.status = 'ACTIVE' AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);
}
