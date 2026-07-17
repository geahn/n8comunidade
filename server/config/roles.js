// Vocabulário canônico de papéis — deve espelhar o enum `user_role` do banco
// (ver database.sql). Toda checagem de autorização no servidor usa estas
// constantes para evitar divergência de nomes entre rotas.
const ROLES = Object.freeze({
    USER: 'user',
    STORE_OWNER: 'store_owner',
    DRIVER: 'driver',
    ADMIN: 'admin', // administrador de bairro
    SUPERADMIN: 'superadmin', // administrador global
});

// Agrupamentos úteis para autorização
const ADMIN_ROLES = Object.freeze([ROLES.ADMIN, ROLES.SUPERADMIN]);

module.exports = { ROLES, ADMIN_ROLES };
