-- 000: Arquiva tabelas de uma iteração antiga do app cujo formato conflita
-- com o schema atual (ids integer, colunas pt-BR como bairro_id, etc.).
-- NADA é apagado: apenas renomeadas com prefixo legacy_v1_ para consulta.
-- Em banco novo, os IF EXISTS tornam tudo no-op.

ALTER TABLE IF EXISTS users RENAME TO legacy_v1_users;
ALTER TABLE IF EXISTS news RENAME TO legacy_v1_news;
ALTER TABLE IF EXISTS orders RENAME TO legacy_v1_orders;
ALTER TABLE IF EXISTS products RENAME TO legacy_v1_products;
ALTER TABLE IF EXISTS mini_banners RENAME TO legacy_v1_mini_banners;
