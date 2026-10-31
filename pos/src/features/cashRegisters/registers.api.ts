import api from "../../api/axios.js";

export interface RegisterSummary {
  id: number;
  name: string;
  status: string;
  openSession: {
    id: number;
    userName: string;
    openingCash: number;
    openedAt: string | null;
  } | null;
}

export interface RegisterSession {
  id: number;
  registerId: number;
  registerName: string;
  locationId: number;
  locationName: string;
  userName: string;
  status: string;
  openingCash: number;
  expectedCash: number;
  countedCash: number | null;
  difference: number | null;
  notes: string | null;
  openedAt: string | null;
  closedAt: string | null;
}

export interface RegisterTransaction {
  id: number;
  type: "sale" | "cash_in" | "cash_out";
  amount: number;
  referenceType: string | null;
  referenceId: number | null;
  note: string | null;
  userName: string;
  createdAt: string | null;
}

export async function getRegistersApi(): Promise<RegisterSummary[]> {
  const res = await api.get<{ success: boolean; data: RegisterSummary[] }>(
    "/registers",
  );
  return res.data.data;
}

export async function getCurrentSessionApi(): Promise<RegisterSession | null> {
  const res = await api.get<{ success: boolean; data: RegisterSession | null }>(
    "/sessions/current",
  );
  return res.data.data;
}

export async function openRegisterApi(
  registerId: number,
  openingCash: number,
): Promise<RegisterSession> {
  const res = await api.post<{ success: true; data: RegisterSession }>(
    `/registers/${registerId}/open`,
    { openingCash },
  );
  return res.data.data;
}

export async function addCashMovementApi(
  sessionId: number,
  type: "cash_in" | "cash_out",
  amount: number,
  note?: string,
): Promise<RegisterSession> {
  const res = await api.post<{ success: boolean; data: RegisterSession }>(
    `/sessions/${sessionId}/cash-movement`,
    { type, amount, note },
  );
  return res.data.data;
}

export async function closeRegisterApi(
  sessionId: number,
  countedCash: number,
  notes?: string,
): Promise<RegisterSession> {
  const res = await api.post<{ success: boolean; data: RegisterSession }>(
    `/sessions/${sessionId}/close`,
    { countedCash, notes },
  );
  return res.data.data;
}

export type { RegisterTransaction as SessionDetail };
export async function getSessionApi(sessionId: number): Promise<
  RegisterSession & { transactions: RegisterTransaction[] }
> {
  const res = await api.get<{
    success: boolean;
    data: RegisterSession & { transactions: RegisterTransaction[] };
  }>(`/sessions/${sessionId}`);
  return res.data.data;
}
