import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import useProductStore from "../useProductStore";
import { useState } from "react";
import { VariantTypeDialog } from "../components/variants/VariantTypeDialog";
import { VariantOptionDialog } from "../components/variants/VariantOptionDialog";
export function VariantManager() {
  const { productVariantOptions } = useProductStore();
  const [activeId, setActiveId] = useState<number | null>(null);
  const activeVariant = productVariantOptions.find(
    (variant) => variant.typeId === activeId,
  );
  return (
    <div className="p-5 space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            Manage variant types and their available options.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* 1. The Two-Panel Layout */}
          <div className="flex gap-5 items-start">
            {/* 2. LEFT PANEL: Variant Types */}
            <Card className="w-1/3">
              <CardHeader>
                <CardTitle>Variant Type</CardTitle>
                <CardAction>
                  <VariantTypeDialog />
                </CardAction>
              </CardHeader>
              <CardContent>
                {productVariantOptions.map((variant) => {
                  const active = activeId === variant.typeId;
                  return (
                    <div
                      key={variant.typeId}
                      onClick={() => {
                        setActiveId(variant.typeId);
                      }}
                      className={`flex items-center justify-between ${active ? "bg-accent" : "text-muted-foreground"} hover:bg-accent/50 rounded-md px-3 py-2 font-medium cursor-pointer`}
                    >
                      <span>{variant.typeName}</span>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            {/* 3. RIGHT PANEL: Options List */}
            <Card className="w-2/3">
              <CardHeader>
                <CardTitle>
                  {activeVariant
                    ? `${activeVariant?.typeName} Options`
                    : "Select Variant Type First"}{" "}
                </CardTitle>
                <CardAction>
                  {activeVariant && (
                    <VariantOptionDialog activeVariant={activeVariant} />
                  )}
                </CardAction>
              </CardHeader>
              <CardContent>
                {activeVariant?.options.length !== 0 ? (
                  activeVariant?.options.map((option, index) => (
                    <div
                      key={`${option}-${index}`}
                      className="flex items-center justify-between border rounded-md px-3 py-2 "
                    >
                      <span>{option.value}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <MoreHorizontal />
                      </Button>
                    </div>
                  ))
                ) : (
                  <span className="text-center border border-dashed rounded p-5 text-xl">
                    Add Variant Options First
                  </span>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
