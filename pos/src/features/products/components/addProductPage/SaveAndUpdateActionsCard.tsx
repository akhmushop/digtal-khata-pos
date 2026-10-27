import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { ProductTypeInput } from "../../product.schema";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";

export function SaveAndUpdateActionsCard({
  form,
  isEditing,
  onCancel,
}: {
  form: UseFormReturn<ProductTypeInput>;
  isEditing: boolean;
  onCancel: () => void;
}) {
  const isSubmitting = form.formState.isSubmitting
  const rootErrors = form.formState.errors.variants?.root?.message;
  const errors = form.formState.errors.variants?.message;
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={isSubmitting || !form.formState.isDirty}
          type="submit"
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Spinner /> {isEditing ? "Updating" : "Creating"}
            </>
          ) : (
            <>
              <Save />
              {isEditing ? "Update Product" : "Create Product"}
            </>
          )}
        </Button>
      </CardContent>
      {/* Check for both root.message and message to cover all states */}
      {(rootErrors || errors) && (
        <CardFooter className="text-sm font-medium text-destructive mt-2">
          {rootErrors || errors}
        </CardFooter>
      )}
    </Card>
  );
}
