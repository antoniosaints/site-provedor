export type AdminRole = 'admin' | 'gerente' | 'atendente';

export const allAdminRoles: AdminRole[] = ['admin', 'gerente', 'atendente'];
export const managerAdminRoles: AdminRole[] = ['admin', 'gerente'];
export const adminOnlyRoles: AdminRole[] = ['admin'];

export const roleLabels: Record<AdminRole, string> = {
  admin: 'Admin',
  gerente: 'Gerente',
  atendente: 'Atendente'
};

export function hasAdminRole(role: string | undefined, allowed: readonly AdminRole[]) {
  return Boolean(role && allowed.includes(role as AdminRole));
}
