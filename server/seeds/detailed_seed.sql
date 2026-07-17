-- Comprehensive Seed Script for 2 Detailed Neighborhoods
DO $$
DECLARE
    p_neigh_id UUID;
    c_neigh_id UUID;
    u_id UUID;
    s1_id UUID; s2_id UUID; s3_id UUID; s4_id UUID; s5_id UUID;
    s6_id UUID; s7_id UUID; s8_id UUID; s9_id UUID; s10_id UUID;
BEGIN
    -- 1. Get User
    SELECT id INTO u_id FROM users WHERE email = 'contato@geahn.com' LIMIT 1;
    
    -- 2. Create Neighborhoods
    INSERT INTO neighborhoods (name, slug, status) 
    VALUES ('Bairro das Palmeiras', 'palmeiras', 'active')
    ON CONFLICT (slug) DO UPDATE SET status = 'active'
    RETURNING id INTO p_neigh_id;

    INSERT INTO neighborhoods (name, slug, status) 
    VALUES ('Centro Histórico', 'centro', 'active')
    ON CONFLICT (slug) DO UPDATE SET status = 'active'
    RETURNING id INTO c_neigh_id;

    -- 3. Update User to one of those
    UPDATE users SET neighborhood_id = p_neigh_id WHERE id = u_id;

    -- 4. Delete existing data for these neighborhoods to avoid duplicates in testing
    DELETE FROM mini_banners WHERE neighborhood_id IN (p_neigh_id, c_neigh_id);
    DELETE FROM news WHERE neighborhood_id IN (p_neigh_id, c_neigh_id);
    DELETE FROM ads WHERE neighborhood_id IN (p_neigh_id, c_neigh_id);
    DELETE FROM shops WHERE neighborhood_id IN (p_neigh_id, c_neigh_id);

    -- 5. Bairro das Palmeiras - Shops
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (p_neigh_id, u_id, 'Palmeiras Gourmet', 'Alta gastronomia no coração do bairro.', 'active', 4.9, 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800')
    RETURNING id INTO s1_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (p_neigh_id, u_id, 'Padaria Esquina', 'Pão quentinho a toda hora.', 'active', 4.7, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800')
    RETURNING id INTO s2_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (p_neigh_id, u_id, 'Mercado Central', 'Tudo o que você precisa perto de você.', 'active', 4.5, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800')
    RETURNING id INTO s3_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (p_neigh_id, u_id, 'Palmeiras Fitness', 'A melhor academia da região.', 'active', 4.8, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800')
    RETURNING id INTO s4_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (p_neigh_id, u_id, 'Pet Shop Amigo', 'Cuidado especial para seu pet.', 'active', 4.6, 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=200', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800')
    RETURNING id INTO s5_id;

    -- 6. Centro Histórico - Shops
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (c_neigh_id, u_id, 'Café do Museu', 'Café com história e sabor.', 'active', 4.9, 'https://images.unsplash.com/photo-1501339817302-382d129f1967?w=200', 'https://images.unsplash.com/photo-1501339817302-382d129f1967?w=800')
    RETURNING id INTO s6_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (c_neigh_id, u_id, 'Livraria Velha', 'Raridades e clássicos.', 'active', 4.8, 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=200', 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800')
    RETURNING id INTO s7_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (c_neigh_id, u_id, 'Antiquário Imperial', 'Móveis e objetos de época.', 'active', 4.7, 'https://images.unsplash.com/photo-1534073737927-85f1df9605d2?w=200', 'https://images.unsplash.com/photo-1534073737927-85f1df9605d2?w=800')
    RETURNING id INTO s8_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (c_neigh_id, u_id, 'Restaurante da Praça', 'Comida caseira tradicional.', 'active', 4.5, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800')
    RETURNING id INTO s9_id;
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating, logo_url, cover_url)
    VALUES (c_neigh_id, u_id, 'Barbearia Retrô', 'Estilo e tradição.', 'active', 4.6, 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200', 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800')
    RETURNING id INTO s10_id;

    -- 7. Banners
    INSERT INTO mini_banners (neighborhood_id, title, image_url, action_type, action_target, is_active, order_index)
    VALUES 
    (p_neigh_id, 'Promoção Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400', 'screen', 'Lojas', true, 1),
    (p_neigh_id, 'Academia Open', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400', 'screen', 'Lojas', true, 2),
    (p_neigh_id, 'Novidades News', 'https://images.unsplash.com/photo-1504711432869-748576d639e7?w=400', 'screen', 'Notícias', true, 3),
    (p_neigh_id, 'Dicas de Bike', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400', 'screen', 'Classificados', true, 4);

    INSERT INTO mini_banners (neighborhood_id, title, image_url, action_type, action_target, is_active, order_index)
    VALUES 
    (c_neigh_id, 'Feira de Antiguidades', 'https://images.unsplash.com/photo-1534073737927-85f1df9605d2?w=400', 'screen', 'Classificados', true, 1),
    (c_neigh_id, 'Noite do Jazz', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400', 'screen', 'Notícias', true, 2),
    (c_neigh_id, 'Menu Degustação', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400', 'screen', 'Lojas', true, 3),
    (c_neigh_id, 'Tour Histórico', 'https://images.unsplash.com/photo-1501339817302-382d129f1967?w=400', 'screen', 'Notícias', true, 4);

    -- 8. News
    INSERT INTO news (neighborhood_id, author_id, title, content, status, image_url)
    VALUES 
    (p_neigh_id, u_id, 'Nova Pista de Caminhada', 'A pista de caminhada das Palmeiras foi reformada e está pronta para uso!', 'published', 'https://images.unsplash.com/photo-1541480601022-2bc09c74a9b7?w=600'),
    (p_neigh_id, u_id, 'Campanha de Vacinação', 'Sábado teremos vacinação no posto central do bairro.', 'published', 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=600'),
    (c_neigh_id, u_id, 'Restauração da Igreja', 'A histórica Igreja Matriz passará por restauro completo.', 'published', 'https://images.unsplash.com/photo-1548690312-e3b507d17a4d?w=600'),
    (c_neigh_id, u_id, 'Festival de Inverno', 'O festival de inverno do centro começa na próxima sexta.', 'published', 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600');

    -- 9. Ads
    INSERT INTO ads (neighborhood_id, user_id, title, description, price, status, images, category)
    VALUES 
    (p_neigh_id, u_id, 'iPhone 13 Pro', 'Estado de novo, 128GB.', 3500.00, 'active', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400'], 'Eletrônicos'),
    (p_neigh_id, u_id, 'Mesa de Jantar', 'Mesa com 6 cadeiras em madeira.', 1200.00, 'active', ARRAY['https://images.unsplash.com/photo-1530018607912-eff231abc92c?w=400'], 'Móveis'),
    (c_neigh_id, u_id, 'Vitrola Antiga', 'Funcionando perfeitamente, bivolt.', 800.00, 'active', ARRAY['https://images.unsplash.com/photo-1534073737927-85f1df9605d2?w=400'], 'Colecionáveis'),
    (c_neigh_id, u_id, 'Livros de Arte', 'Coleção completa de história da arte.', 450.00, 'active', ARRAY['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400'], 'Livros');

END $$;
