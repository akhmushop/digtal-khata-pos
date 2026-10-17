import { HoldCartItems } from "@/features/pos/types/cart.types";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useCartStore,
  useHoldCartStore,
} from "@/features/pos/stores/useCartStore";
import { HeldItemsDialog } from "./HeldItemsDialog";

export function HoldDropdownMenu() {
  const [open, setOpen] = useState(false);
  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
  }
  const resetCart = useCartStore((state) => state.resetCart);
  const cart = useCartStore((state) => state.cart);
  const { addHoldCart } = useHoldCartStore();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button className="w-full">HOLD</Button>}
        ></DropdownMenuTrigger>
        <DropdownMenuContent side="top">
          <DropdownMenuItem
            disabled={cart.length === 0}
            variant="destructive"
            onClick={() => {
              addHoldCart(cart);
              resetCart();
            }}
          >
            Hold
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Held Items
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <HeldItemsDialog open={open} handleOpenChange={handleOpenChange} />
    </>
  );
}
