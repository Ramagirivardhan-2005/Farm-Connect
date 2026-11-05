-- ==============================================================================
-- FARMCONNECT DEMO SEED DATA (MySQL 8 - Flyway V2)
-- Password for all accounts is: password123 (BCrypt: $2a$12$NqL7nfgmIuK7r2O8.i3dTe3.p3BqY1j8eL6yOQj6Yf0I8K6W0A0Wy)
-- ==============================================================================

-- 1. Insert Users
INSERT INTO users (id, user_id, username, email, mobile, password_hash, role, is_active, is_email_verified, is_mobile_verified)
VALUES 
(1, 'RV10241', 'Ramagiri Vardhan', 'vardhan@farmconnect.org', '+919876543210', '$2b$10$C7A29oyrVOLg3qFSG8DKKOGidq7LV4C9Ok52yB8oylPtFqqZIFelm', 'CUSTOMER', TRUE, TRUE, TRUE),
(2, 'KS99201', 'Kisan Ramesh Patil', 'ramesh.patil@greenfarms.org', '+919423177654', '$2b$10$C7A29oyrVOLg3qFSG8DKKOGidq7LV4C9Ok52yB8oylPtFqqZIFelm', 'FARMER', TRUE, TRUE, TRUE),
(3, 'DP88102', 'Suresh Express Rider', 'suresh.deliveries@farmconnect.org', '+919822011988', '$2b$10$C7A29oyrVOLg3qFSG8DKKOGidq7LV4C9Ok52yB8oylPtFqqZIFelm', 'DELIVERY_PARTNER', TRUE, TRUE, TRUE),
(4, 'FCADMIN01', 'Super Admin Administrator', 'admin@farmconnect.org', '+919900000001', '$2b$10$C7A29oyrVOLg3qFSG8DKKOGidq7LV4C9Ok52yB8oylPtFqqZIFelm', 'SUPER_ADMIN', TRUE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- 2. Insert Profiles
INSERT INTO customers (user_id, preferred_language, loyalty_points)
VALUES (1, 'en', 150)
ON DUPLICATE KEY UPDATE loyalty_points = 150;

INSERT INTO farmers (user_id, farm_name, farm_location, farm_size_acres, bio, rating, is_verified)
VALUES (2, 'Sahyadri Organic Orchards & Greens', 'Junnar, Pune District, Maharashtra', 14.5, 'Multi-generational farm practicing zero-budget natural farming and heritage indigenous varieties.', 4.90, TRUE)
ON DUPLICATE KEY UPDATE rating = 4.90;

INSERT INTO delivery_agents (user_id, delivery_agent_id, full_name, email, mobile, alt_mobile, vehicle_type, vehicle_number, service_area, status, rating, total_deliveries, active_deliveries, today_earnings, lifetime_earnings, bank_name, bank_account, bank_ifsc, is_verified)
VALUES (3, 'DP88102', 'Suresh Express Rider', 'suresh.deliveries@farmconnect.org', '+919822011988', '+918765400001', 'Electric Cargo Scooter', 'MH-14-EF-9201', 'Pune Metro & PCMC Zone', 'AVAILABLE', 4.90, 342, 1, 1480.00, 48650.00, 'HDFC Bank', '••••••••8912', 'HDFC0001824', TRUE)
ON DUPLICATE KEY UPDATE status = 'AVAILABLE';

-- 3. Insert Farmer Delivery Channel
INSERT INTO farmer_channels (id, channel_id, farmer_id, name, description, default_delivery_fee, free_delivery_threshold, max_delivery_charge, status)
VALUES (1, 'FC-CH-00001245', 2, 'Sahyadri Organic Direct Express', 'Cold-chain dispatch fleet connecting Junnar farm gate directly to Pune doorstep customers.', 40.00, 499.00, 100.00, 'ACTIVE')
ON DUPLICATE KEY UPDATE status = 'ACTIVE';

-- 4. Assign Delivery Agent to Channel
INSERT INTO channel_delivery_agents (channel_id, delivery_agent_id)
VALUES (1, 1)
ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP;

-- 5. Product Categories
INSERT INTO product_categories (id, name, slug, description, is_active)
VALUES 
(1, 'Fresh Vegetables', 'fresh-vegetables', 'Farm-harvested daily vegetables, zero synthetic chemicals', TRUE),
(2, 'Organic Fruits', 'organic-fruits', 'Orchard fresh seasonal fruits ripened naturally on tree', TRUE),
(3, 'Heirloom Grains & Pulses', 'heirloom-grains', 'Native heirloom seeds, stone-ground flours and unpolished pulses', TRUE),
(4, 'Farm Dairy & Cold-Pressed Oils', 'dairy-oils', 'A2 Desi Cow Ghee and wood-pressed edible oils', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- 6. Products
INSERT INTO products (id, product_id, farmer_id, category_id, name, description, price, unit, stock_quantity, rating, is_active)
VALUES
(1, 'PRD-101', 2, 1, 'Vine-Ripened Country Tomatoes', 'Naturally grown indigenous country tomatoes with high lycopene content. Harvested at dawn.', 40.00, 'KG', 250.00, 4.9, TRUE),
(2, 'PRD-102', 2, 1, 'Hydroponic Baby Spinach', 'Tender, pesticide-free baby spinach harvested root-on for maximum crispness and iron retention.', 30.00, 'Bundle', 180.00, 4.8, TRUE),
(3, 'PRD-103', 2, 2, 'Kesar Mangoes (Tree-Ripened)', 'Certified organic GI-tagged Junnar Kesar mangoes ripened with rice-hay.', 350.00, 'Dozen', 120.00, 5.0, TRUE),
(4, 'PRD-104', 2, 3, 'Heirloom Bhalia Wheat Flour', 'Nutrient-rich ancient wheat flour slow stone-ground at low temperatures.', 85.00, 'KG', 400.00, 4.9, TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- 7. Addresses
INSERT INTO addresses (id, user_id, full_name, mobile, house, street, village, district, state, pincode, landmark, type, is_default)
VALUES (1, 1, 'Ramagiri Vardhan', '+91 98765 43210', 'Flat 402, Green Meadows Apartment', 'Kothrud Hill View Road', 'Kothrud', 'Pune', 'Maharashtra', '411038', 'Near MIT World Peace Dome', 'Home', TRUE)
ON DUPLICATE KEY UPDATE is_default = TRUE;

-- 8. Wallets
INSERT INTO wallets (id, user_id, balance)
VALUES 
(1, 1, 2450.00),
(2, 2, 84500.00),
(3, 3, 4200.00)
ON DUPLICATE KEY UPDATE balance = VALUES(balance);

-- 9. Wallet Transactions
INSERT INTO wallet_transactions (id, tx_id, wallet_id, user_id, type, amount, balance_after, reference, status)
VALUES
(1, 'TXN-98421034', 1, 1, 'WALLET_RECHARGE', 2000.00, 2450.00, 'Initial secure purse top-up via UPI', 'SUCCESS')
ON DUPLICATE KEY UPDATE status = 'SUCCESS';

-- 10. Promo Codes
INSERT INTO promo_codes (id, code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, used_count, is_active)
VALUES
(1, 'FARM10', '10% instant discount on fresh morning harvest', 'PERCENTAGE', 10.00, 200.00, 150.00, 1000, 4, TRUE),
(2, 'HARVEST50', 'Flat ₹50 off on orders above ₹400', 'FLAT', 50.00, 400.00, 50.00, 500, 2, TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- 11. Initial Order
INSERT INTO orders (id, order_id, customer_id, farmer_id, delivery_channel_id, delivery_agent_id, status, subtotal, delivery_fee, delivery_fee_reason, promo_code, promo_discount, total_amount, expected_delivery_date, delivery_otp, delivery_otp_expires_at)
VALUES
(1, 'ORD-2026-91823', 1, 2, 1, 1, 'OUT_FOR_DELIVERY', 210.00, 0.00, 'Free Delivery (Order >= ₹499 promo)', 'FARM10', 21.00, 189.00, DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY), '123456', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 24 HOUR))
ON DUPLICATE KEY UPDATE status = VALUES(status);

INSERT INTO order_items (id, order_id, product_id, name, price, quantity, unit, subtotal)
VALUES
(1, 1, 1, 'Vine-Ripened Country Tomatoes', 40.00, 2.00, 'KG', 80.00),
(2, 1, 2, 'Hydroponic Baby Spinach', 30.00, 1.00, 'Bundle', 30.00),
(3, 1, 4, 'Heirloom Bhalia Wheat Flour', 85.00, 1.00, 'KG', 85.00)
ON DUPLICATE KEY UPDATE subtotal = VALUES(subtotal);

INSERT INTO order_addresses (id, order_id, full_name, mobile, house, street, village, district, state, pincode, landmark, type)
VALUES
(1, 1, 'Ramagiri Vardhan', '+91 98765 43210', 'Flat 402, Green Meadows Apartment', 'Kothrud Hill View Road', 'Kothrud', 'Pune', 'Maharashtra', '411038', 'Near MIT World Peace Dome', 'Home')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);
