-- ==============================================================================
-- FARMCONNECT DISCOVERY, SOCIAL FEED & LOCATION AWARENESS (MySQL 8 - Flyway V3)
-- ==============================================================================

-- 1. Extend Farmers with Latitude and Longitude for Proximity Calculations
ALTER TABLE farmers 
    ADD COLUMN latitude DECIMAL(10, 8) DEFAULT 18.52040000,
    ADD COLUMN longitude DECIMAL(11, 8) DEFAULT 73.85670000,
    ADD COLUMN cover_image_url VARCHAR(500) NULL,
    ADD COLUMN follower_count INT NOT NULL DEFAULT 1250;

-- 2. Extend Addresses with Latitude and Longitude for Customer Proximity
ALTER TABLE addresses 
    ADD COLUMN latitude DECIMAL(10, 8) DEFAULT 18.50740000,
    ADD COLUMN longitude DECIMAL(11, 8) DEFAULT 73.80770000;

-- 3. Extend Farmer Channels with Media, Metrics, and Location
ALTER TABLE farmer_channels
    ADD COLUMN banner_image VARCHAR(500) NULL,
    ADD COLUMN logo_image VARCHAR(500) NULL,
    ADD COLUMN follower_count INT NOT NULL DEFAULT 1420,
    ADD COLUMN like_count INT NOT NULL DEFAULT 860,
    ADD COLUMN latitude DECIMAL(10, 8) DEFAULT 18.52040000,
    ADD COLUMN longitude DECIMAL(11, 8) DEFAULT 73.85670000,
    ADD INDEX idx_channels_loc (latitude, longitude);

-- 4. Extend Products with Interaction Metrics & Availability
ALTER TABLE products 
    ADD COLUMN available_quantity DECIMAL(10, 2) NOT NULL DEFAULT 150.00,
    ADD COLUMN like_count INT NOT NULL DEFAULT 42,
    ADD COLUMN view_count INT NOT NULL DEFAULT 280,
    ADD COLUMN tags VARCHAR(255) DEFAULT 'Organic, Farm Fresh, Zero Pesticide';

-- 5. Farmer Channel Posts Table (Instruction 13, 14, 25, 29)
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id VARCHAR(50) NOT NULL UNIQUE,
    channel_id BIGINT NOT NULL,
    farmer_id BIGINT NOT NULL,
    product_id BIGINT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    price DECIMAL(10, 2) NULL,
    discount_percent INT DEFAULT 0,
    unit VARCHAR(30) DEFAULT 'KG',
    available_quantity DECIMAL(10, 2) NULL,
    category VARCHAR(100) NULL,
    tags VARCHAR(255) NULL,
    call_to_action VARCHAR(50) DEFAULT 'Shop Now',
    media_url VARCHAR(500) NULL,
    original_post_id BIGINT NULL,
    repost_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    view_count INT NOT NULL DEFAULT 0,
    status ENUM('ACTIVE', 'HIDDEN', 'FLAGGED', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (channel_id) REFERENCES farmer_channels(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE SET NULL,
    INDEX idx_posts_channel (channel_id),
    INDEX idx_posts_farmer (farmer_id),
    INDEX idx_posts_product (product_id),
    INDEX idx_posts_status (status),
    INDEX idx_posts_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Post Likes Table (Instruction 17)
CREATE TABLE IF NOT EXISTS post_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_post_user (post_id, user_id),
    INDEX idx_pl_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Post Comments Table (Instruction 18)
CREATE TABLE IF NOT EXISTS post_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    comment TEXT NOT NULL,
    parent_comment_id BIGINT NULL,
    status ENUM('ACTIVE', 'FLAGGED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
    INDEX idx_comments_post (post_id, created_at ASC),
    INDEX idx_comments_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Product Likes Table (Instruction 21)
CREATE TABLE IF NOT EXISTS product_likes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_product_user (product_id, user_id),
    INDEX idx_prl_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Unified User Interactions & Event Logging (Instruction 20, 21, 31)
CREATE TABLE IF NOT EXISTS user_interactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    session_id VARCHAR(100) NULL,
    target_type ENUM('PRODUCT', 'CHANNEL', 'POST', 'SEARCH') NOT NULL,
    target_id BIGINT NULL,
    event_type ENUM(
        'PRODUCT_VIEW', 'PRODUCT_CLICK', 'PRODUCT_SEARCH', 'PRODUCT_LIKE', 
        'PRODUCT_ADD_TO_CART', 'PRODUCT_PURCHASE', 'CHANNEL_VIEW', 
        'CHANNEL_FOLLOW', 'CHANNEL_LIKE', 'POST_VIEW', 'POST_LIKE', 
        'POST_COMMENT', 'POST_SHARE', 'SEARCH'
    ) NOT NULL,
    query_text VARCHAR(255) NULL,
    metadata JSON NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ui_user_event (user_id, event_type, created_at DESC),
    INDEX idx_ui_target (target_type, target_id),
    INDEX idx_ui_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Seed Demo Channels & Initial Posts for Rich Discovery
INSERT INTO farmer_channels (id, channel_id, farmer_id, name, description, default_delivery_fee, free_delivery_threshold, max_delivery_charge, status, banner_image, follower_count, like_count, latitude, longitude)
VALUES 
(2, 'FC-CH-00002931', 2, 'Green Valley Organic Collective', 'Zero-pesticide heritage vegetables harvested daily at dawn from the lush valleys of Junnar.', 35.00, 449.00, 80.00, 'ACTIVE', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80', 3240, 1890, 18.53120000, 73.84450000),
(3, 'FC-CH-00003844', 2, 'Nashik Cold-Chain Vineyards', 'Direct-to-home vineyard grapes and orchard fruits picked and packed under refrigerated transport.', 50.00, 599.00, 100.00, 'ACTIVE', 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', 2180, 1420, 18.54890000, 73.82100000)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Update existing channel #1 with banner and coordinates
UPDATE farmer_channels 
SET banner_image = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    latitude = 18.51450000,
    longitude = 73.81800000,
    follower_count = 4120,
    like_count = 2450
WHERE id = 1;

-- Seed Demo Posts
INSERT INTO posts (id, post_id, channel_id, farmer_id, product_id, title, content, price, discount_percent, unit, available_quantity, category, tags, call_to_action, media_url, like_count, comment_count, view_count, status)
VALUES 
(1, 'POST-101', 1, 2, 1, 'Dawn Harvest: Fresh Indigenous Country Tomatoes!', 'Our first crate of vine-ripened indigenous country tomatoes harvested this morning at 6:00 AM. High in lycopene and naturally sweet, perfect for curries and farm salads.', 40.00, 10, 'KG', 120.00, 'Fresh Vegetables', 'Fresh Harvest, Tomatoes, Country, Organic', 'Shop Now', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80', 58, 6, 420, 'ACTIVE'),
(2, 'POST-102', 1, 2, 2, 'Hydroponic Tender Baby Spinach is Ready!', 'Crisp, root-on hydroponic baby spinach harvested in our covered greenhouse. Completely free of synthetic soil residues and rich in iron. Limited daily batch!', 30.00, 0, 'Bundle', 80.00, 'Fresh Vegetables', 'Hydroponic, Spinach, Greens, Healthy', 'Shop Now', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80', 43, 3, 310, 'ACTIVE'),
(3, 'POST-103', 2, 2, 3, 'GI-Tagged Junnar Kesar Mangoes - Weekend Special Offer!', 'Pre-orders now open for our tree-ripened, GI-tagged Junnar Kesar Mangoes. Ripened naturally in dry rice-hay without chemical carbides. Unbeatable aroma and sweetness.', 350.00, 15, 'Dozen', 60.00, 'Organic Fruits', 'Mangoes, Kesar, Summer Fruit, Sweet', 'Shop Now', 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80', 92, 12, 850, 'ACTIVE')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Seed Comments on Post 1
INSERT INTO post_comments (id, post_id, user_id, comment, status)
VALUES 
(1, 1, 1, 'Received these yesterday morning in Kothrud! The aroma and freshness is leagues better than supermarket tomatoes.', 'ACTIVE'),
(2, 1, 3, 'Confirming prompt cold-chain delivery for all Kothrud & Baner orders today!', 'ACTIVE')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Seed Initial User Likes
INSERT INTO post_likes (post_id, user_id)
VALUES 
(1, 1),
(2, 1)
ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;

INSERT INTO product_likes (product_id, user_id)
VALUES 
(1, 1),
(3, 1)
ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;
