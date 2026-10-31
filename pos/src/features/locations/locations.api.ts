import api from "../../api/axios.js";

export interface LocationSummary {
  id: number;
  name: string;
  locationCode: string | null;
  locationType: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  isDefault: boolean;
  status: string;
}

export async function getLocationsApi(): Promise<LocationSummary[]> {
  const res = await api.get<{ success: boolean; data: LocationSummary[] }>(
    "/locations",
  );
  return res.data.data;
}

export async function createLocationApi(input: {
  name: string;
  locationCode?: string | undefined;
  locationType: string;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  isDefault?: boolean | undefined;
}): Promise<LocationSummary> {
  const res = await api.post<{ success: boolean; data: LocationSummary }>(
    "/locations",
    input,
  );
  return res.data.data;
}

export async function updateLocationApi(
  locationId: number,
  input: {
    name?: string | undefined;
    locationCode?: string | null | undefined;
    locationType?: string | undefined;
    phone?: string | null | undefined;
    email?: string | null | undefined;
    address?: string | null | undefined;
    city?: string | null | undefined;
    isDefault?: boolean | undefined;
    status?: "active" | "inactive" | undefined;
  },
): Promise<LocationSummary> {
  const res = await api.patch<{ success: boolean; data: LocationSummary }>(
    `/locations/${locationId}`,
    input,
  );
  return res.data.data;
}

export async function deleteLocationApi(locationId: number): Promise<void> {
  await api.delete(`/locations/${locationId}`);
}
