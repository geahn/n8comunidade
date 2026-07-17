// Vocabulário canônico de papéis — deve espelhar o enum do banco e o server.
export const ROLES = {
    USER: 'user',
    STORE_OWNER: 'store_owner',
    DRIVER: 'driver',
    ADMIN: 'admin', // administrador de bairro
    SUPERADMIN: 'superadmin', // administrador global
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Metadados de exibição por papel (label + cores) usados nos painéis/perfil.
export const ROLE_META: Record<string, { label: string; color: string; bg: string }> = {
    [ROLES.USER]: { label: 'Morador', color: '#334155', bg: '#f1f5f9' },
    [ROLES.STORE_OWNER]: { label: 'Parceiro Lojista', color: '#059669', bg: '#ecfdf5' },
    [ROLES.DRIVER]: { label: 'Entregador', color: '#d97706', bg: '#fffbeb' },
    [ROLES.ADMIN]: { label: 'Líder de Bairro', color: '#7c3aed', bg: '#f5f3ff' },
    [ROLES.SUPERADMIN]: { label: 'Super Administrador', color: '#dc2626', bg: '#fff1f2' },
};

export const PANEL_ROLES: string[] = [ROLES.STORE_OWNER, ROLES.DRIVER, ROLES.ADMIN, ROLES.SUPERADMIN];
