import api from "../../api/axios.js";

export interface RoleSummary {
  id: number;
  name: string;
  slug: string;
  isSystem: boolean;
  permissionKeys: string[];
  userCount: number;
}

export interface PermissionCatalogEntry {
  key: string;
  module: string | null;
  description: string | null;
}

export async function getRolesApi(): Promise<RoleSummary[]> {
  const res = await api.get<{ success: boolean; data: RoleSummary[] }>(
    "/roles",
  );
  return res.data.data;
}

export async function getPermissionCatalogApi(): Promise<
  PermissionCatalogEntry[]
> {
  const res = await api.get<{
    success: boolean;
    data: PermissionCatalogEntry[];
  }>("/permissions");
  return res.data.data;
}

export async function createRoleApi(input: {
  name: string;
  permissionKeys: string[];
}): Promise<RoleSummary> {
  const res = await api.post<{ success: boolean; data: RoleSummary }>(
    "/roles",
    input,
  );
  return res.data.data;
}

export async function updateRoleApi(
  roleId: number,
  input: { name?: string; permissionKeys?: string[] },
): Promise<RoleSummary> {
  const res = await api.patch<{ success: boolean; data: RoleSummary }>(
    `/roles/${roleId}`,
    input,
  );
  return res.data.data;
}

export async function deleteRoleApi(roleId: number): Promise<void> {
  await api.delete(`/roles/${roleId}`);
}

export async function getRoleUsersApi(
  roleId: number,
): Promise<{ userId: number; fullName: string; email: string; isActive: boolean }[]> {
  const res = await api.get<{
    success: boolean;
    data: { userId: number; fullName: string; email: string; isActive: boolean }[];
  }>(`/roles/${roleId}/users`);
  return res.data.data;
}
