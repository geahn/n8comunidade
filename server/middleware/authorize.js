const db = require('../db');
const { ROLES } = require('../config/roles');

// Exige que req.user.role esteja em `allowed`. Assume que o middleware `auth`
// já rodou e populou req.user.
function requireRole(...allowed) {
    return (req, res, next) => {
        if (!req.user || !allowed.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
}

// Garante que o usuário é dono da loja informada (ou superadmin).
// `shopIdFrom` diz de onde extrair o shop_id: 'body' | 'params' | 'query'.
function requireShopOwnership(shopIdFrom = 'body', field = 'shop_id') {
    return async (req, res, next) => {
        if (req.user.role === ROLES.SUPERADMIN) return next();

        const shopId = req[shopIdFrom]?.[field];
        if (!shopId) return res.status(400).json({ message: 'shop_id ausente' });

        try {
            const result = await db.query(
                'SELECT id FROM shops WHERE id = $1 AND owner_id = $2',
                [shopId, req.user.id]
            );
            if (result.rows.length === 0) {
                return res.status(403).json({ message: 'Não autorizado para esta loja' });
            }
            next();
        } catch (err) {
            console.error('requireShopOwnership error:', err);
            res.status(500).json({ message: 'Server error' });
        }
    };
}

module.exports = { requireRole, requireShopOwnership };
