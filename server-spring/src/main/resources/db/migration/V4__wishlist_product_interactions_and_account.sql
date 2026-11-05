-- ==============================================================================
-- FARMCONNECT WISHLIST, PRODUCT INTERACTIONS & ACCOUNT SETTINGS (Flyway V4)
-- ==============================================================================

-- 1. Extend Users table for Account Settings
ALTER TABLE users 
    ADD COLUMN alt_mobile VARCHAR(20) NULL AFTER mobile,
    ADD COLUMN notification_prefs TEXT NULL AFTER avatar_url,
    ADD COLUMN privacy_settings TEXT NULL AFTER notification_prefs;

-- 2. Dedicated Wishlist Table with Unique Constraint (user_id, product_id)
CREATE TABLE IF NOT EXISTS wishlist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uk_wishlist_user_product (user_id, product_id),
    INDEX idx_wishlist_user (user_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Dedicated Product Comments with Recursive Replies Support
CREATE TABLE IF NOT EXISTS product_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_comment_id BIGINT NULL,
    comment TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'FLAGGED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES product_comments(id) ON DELETE CASCADE,
    INDEX idx_prod_comments_product (product_id, parent_comment_id, created_at DESC),
    INDEX idx_prod_comments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Product Shares Tracking Table
CREATE TABLE IF NOT EXISTS product_shares (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'COPY_LINK',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_prod_shares_product (product_id, created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Product Reports Table
CREATE TABLE IF NOT EXISTS product_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT NULL,
    status ENUM('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prod_reports_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Seed Demo Wishlist Items for User 1 (Ramagiri Vardhan)
INSERT INTO wishlist (user_id, product_id)
VALUES 
(1, 1),
(1, 3)
ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;

-- 7. Seed Demo Product Comments & Nested Replies
INSERT INTO product_comments (id, product_id, user_id, parent_comment_id, comment, like_count, status)
VALUES 
(1, 1, 1, NULL, 'These tomatoes are so sweet and fresh! Made wonderful curry this morning.', 8, 'ACTIVE'),
(2, 1, 2, 1, 'Thank you Vardhan! Picked fresh at dawn from our Junnar red loam plots.', 4, 'ACTIVE'),
(3, 1, 3, NULL, 'Consistent cold-chain delivery keeps the skin firm and aroma intact. Highly recommended.', 5, 'ACTIVE'),
(4, 2, 1, NULL, 'The hydroponic spinach stays fresh in the crisper drawer for over 6 days without wilting!', 6, 'ACTIVE'),
(5, 3, 1, NULL, 'Real tree-ripened Kesar mangoes without calcium carbide. Unbelievable natural perfume.', 12, 'ACTIVE')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 8. Seed Demo Product Share
INSERT INTO product_shares (product_id, user_id, platform)
VALUES 
(1, 1, 'WHATSAPP'),
(3, 1, 'COPY_LINK')
ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;
