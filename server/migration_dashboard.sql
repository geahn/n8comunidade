-- Create mini_banners table
CREATE TABLE IF NOT EXISTS mini_banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    neighborhood_id UUID REFERENCES neighborhoods(id) ON DELETE CASCADE,
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    action_type VARCHAR(50), -- screen, link
    action_target TEXT, -- e.g., 'Shops', 'News', 'https://...'
    is_active BOOLEAN DEFAULT TRUE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mock data for mini_banners
INSERT INTO mini_banners (neighborhood_id, title, image_url, action_type, action_target, order_index)
SELECT id, 'Mercados', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80', 'screen', 'Shops', 1 FROM neighborhoods LIMIT 1;

INSERT INTO mini_banners (neighborhood_id, title, image_url, action_type, action_target, order_index)
SELECT id, 'Restaurantes', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80', 'screen', 'Shops', 2 FROM neighborhoods LIMIT 1;

INSERT INTO mini_banners (neighborhood_id, title, image_url, action_type, action_target, order_index)
SELECT id, 'Classificados', 'https://images.unsplash.com/photo-1454165833767-0e96ef495abb?w=400&q=80', 'screen', 'Classificados', 3 FROM neighborhoods LIMIT 1;

INSERT INTO mini_banners (neighborhood_id, title, image_url, action_type, action_target, order_index)
SELECT id, 'Serviços', 'https://images.unsplash.com/photo-1581578731548-c64695ce6958?w=400&q=80', 'screen', 'Classificados', 4 FROM neighborhoods LIMIT 1;
