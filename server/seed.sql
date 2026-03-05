-- Seed real operational data
-- Use the example neighborhood created earlier
DO $$
DECLARE
    neigh_id UUID;
    user_id UUID;
BEGIN
    SELECT id INTO neigh_id FROM neighborhoods WHERE slug = 'bairro-exemplo' LIMIT 1;
    SELECT id INTO user_id FROM users WHERE email = 'contato@geahn.com' LIMIT 1;

    -- Create a shop
    INSERT INTO shops (neighborhood_id, owner_id, name, description, status, rating)
    VALUES (neigh_id, user_id, 'Burger King Comunitário', 'O melhor hambúrguer do bairro.', 'active', 4.8);

    -- Create some products
    INSERT INTO products (shop_id, name, description, price)
    SELECT id, 'Whopper Bairro', 'Hambúrguer de carne bovina grelhada.', 25.00 FROM shops WHERE name = 'Burger King Comunitário';

    -- Create news
    INSERT INTO news (neighborhood_id, author_id, title, content, status)
    VALUES (neigh_id, user_id, 'Nova Praça Inaugurada', 'A prefeitura inaugurou hoje a nova praça de lazer do nosso bairro.', 'published');

    -- Create ads
    INSERT INTO ads (neighborhood_id, user_id, title, description, price, status)
    VALUES (neigh_id, user_id, 'Bicicleta Usada', 'Bicicleta em bom estado, aro 26.', 350.00, 'active');

END $$;
