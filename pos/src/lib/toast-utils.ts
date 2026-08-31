import { toast } from "@/components/ui/toast";

interface EntityToastProps<TData> {
  data: TData;
  apiCall: (data: TData) => Promise<unknown>;
  entityName: string;
  displayName: string;
}
export async function createEntityPromiseToast<TData>({
  data,
  apiCall,
  entityName,
  displayName,
}: EntityToastProps<TData>) {
  return await toast.promise(apiCall(data), {
    loading: `Creating ${entityName}...`,
    success: () => `${displayName} created successfully!`,
    error: (error) =>
      error?.response?.data?.message ?? `Could not create ${entityName}`,
  });
}
