import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCartStore } from "@/store/useCartStore";
import { useState } from "react";
export function ClearCartDialog() {
  const [open, setOpen] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
  }
  const resetCart = useCartStore((state) => state.resetCart);
  const cart = useCartStore((state) => state.cart);
  const handleClearCart = () => {
    // cart.map((p) => {
    //   restoreAllProductQuantityToCart(p.id, p.soldQuantity);
    // });
    resetCart();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button disabled={cart.length === 0} className="w-full">
            Clear Cart
          </Button>
        }
      />
      <DialogContent showCloseButton={false}>
        <div className={`flex flex-col items-center justify-center `}>
          <span className="text-xl mb-5">Do you want to clear this cart?</span>
          <div className="flex  w-full justify-center gap-3">
            <Button onClick={handleClearCart}>Yes</Button>

            <DialogClose render={<Button>No</Button>} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
