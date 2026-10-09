import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCartStore,
  useHoldCartStore,
} from "@/features/pos/stores/useCartStore";

export function HeldItemsDialog({
  open,
  handleOpenChange,
}: {
  open: boolean;
  handleOpenChange: (open: boolean) => void;
}) {
  const { addHoldItemsToCart } = useCartStore();
  const { holdCartItems, removeHoldCart, clearHoldCarts } = useHoldCartStore();
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/* Removed DialogTrigger completely! */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Held Carts</DialogTitle>
          <DialogDescription>
            Click a held cart to restore it to the active cart.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          {Array.isArray(holdCartItems) && holdCartItems.length > 0 ? (
            holdCartItems.map((cart, index) => (
              <Card
                onClick={() => {
                  addHoldItemsToCart(cart.items);
                  removeHoldCart(cart.id);
                  handleOpenChange(false);
                }}
                className="w-full flex flex-col items-center cursor-pointer mb-2 p-2 rounded"
                key={cart.id}
              >
                <CardContent>
                  <span className="font-bold">{cart.name}</span>
                  <span className="text-sm text-gray-700">{cart.time}</span>
                  <span className="text-sm">{cart.items.length} items</span>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent>
                <span>No held carts yet</span>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              clearHoldCarts();
              handleOpenChange(false);
            }}
          >
            Clear Hold Carts
          </Button>
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
