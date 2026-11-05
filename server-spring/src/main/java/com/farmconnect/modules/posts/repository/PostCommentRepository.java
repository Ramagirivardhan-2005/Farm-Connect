package com.farmconnect.modules.posts.repository;

import com.farmconnect.modules.posts.model.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {
    Page<PostComment> findByPostIdAndStatusOrderByCreatedAtAsc(Long postId, String status, Pageable pageable);
    long countByPostId(Long postId);
}
