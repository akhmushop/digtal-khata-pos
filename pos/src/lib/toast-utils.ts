import { toast } from "@/components/ui/toast";

interface EntityToastProps<TData, TResult = unknown> {
  data: TData;
  apiCall: (data: TData) => Promise<TResult>;
  entityName: string;
  displayName?: string; // Make this optional since we might use the API message
  getSuccessMessage?: (response: TResult) => string; // NEW: Extract message from API
}

export async function createEntityPromiseToast<TData, TResult = unknown>({
  data,
  apiCall,
  entityName,
  displayName,
  getSuccessMessage,
}: EntityToastProps<TData, TResult>) {
  return await toast.promise(apiCall(data), {
    loading: `Processing ${entityName}...`,
    success: (response) => {
      // 1. If you provided a custom message extractor, use it!
      if (getSuccessMessage) {
        return getSuccessMessage(response);
      }
      // 2. Otherwise, fall back to the default displayName message
      return `${displayName || entityName} processed successfully!`;
    },
    error: (error) =>
      error?.response?.data?.message ??
      error?.message ??
      `Could not process ${entityName}`,
  });
}
