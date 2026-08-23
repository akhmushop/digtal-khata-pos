import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Save } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { AddProductFormInput } from "../../product.schema";

export function SaveAndUpdateActionsCard({
  form,
}: {
  form: UseFormReturn<AddProductFormInput>;
}) {
  const rootErrors = form.formState.errors.variants?.root?.message;
  const errors = form.formState.errors.variants?.message;
  return (
    <Card>
      <CardContent className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          <Save />
          {false ? "Update Product" : "Save Product"}
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
