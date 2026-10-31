import api from "../../api/axios.js";

export interface MemberRole {
  id: number;
  name: string;
  slug: string;
}

export interface Member {
  userId: number;
  fullName: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
  primaryRole: MemberRole | null;
  roles: MemberRole[];
}

export async function getUsersApi(): Promise<Member[]> {
  const res = await api.get<{ success: boolean; data: Member[] }>("/users");
  return res.data.data;
}

export async function createStaffUserApi(input: {
  fullName: string;
  email: string;
  password: string;
  roleIds: number[];
}): Promise<Member> {
  const res = await api.post<{ success: boolean; data: Member }>(
    "/users",
    input,
  );
  return res.data.data;
}

export async function updateStaffUserApi(
  userId: number,
  input: { isActive?: boolean; roleIds?: number[] },
): Promise<Member> {
  const res = await api.patch<{ success: boolean; data: Member }>(
    `/users/${userId}`,
    input,
  );
  return res.data.data;
}

export async function resetStaffPasswordApi(
  userId: number,
  password: string,
): Promise<void> {
  await api.post(`/users/${userId}/reset-password`, { password });
}
