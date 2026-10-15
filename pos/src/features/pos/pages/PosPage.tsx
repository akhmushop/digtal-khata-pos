import { useState } from "react";
import { ProductHeader } from "@/features/pos/components/pos/ProductHeader.js";
import { ProductList } from "@/features/pos/components/pos/ProductList.js";
import { CartHeader } from "@/features/pos/components/pos/CartHeader.js";
import CartItems, {
  CartCalculation,
} from "@/features/pos/components/pos/CartItems.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  cartSchema,
  CartSchemaType,
  CreateSalePayload,
  createSalePayloadSchema,
} from "../schemas/cart.schema.js";
import { useCartStore } from "@/features/pos/stores/useCartStore.js";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.js";
import { toast } from "@/components/ui/toast.js";
import { useSalesStore } from "../stores/useSalesStore.js";
import { createEntityPromiseToast } from "@/lib/toast-utils.js";
function Pos() {
  const { cart, resetCart } = useCartStore();
  const [searchProducts, setSearchProducts] = useState("");
  const { createSale } = useSalesStore();
  const form = useForm<CartSchemaType>({
    resolver: zodResolver(cartSchema),
    defaultValues: {
      saleDate: new Date(),
      customerId: null,
      payments: [],
      discount: null,
      vatPercent: null,
    },
  });
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  async function onSubmit(data: CartSchemaType) {
    // 1. Build the raw payload
    const rawPayload = {
      ...data,
      items: cart.map((item) => ({
        variantId: item.variants[0]?.id ?? 0, // Fallback if undefined
        quantity: item.quantity,
        unitPrice: item.variants[0]?.sellingPrice ?? 0,
        discount: item.discount ?? null,
        serialNumbers:
          item.trackingType === "serial" ? item.serialNumbers : undefined,
      })),
    };

    // 2. Validate the payload using Zod!
    const result = createSalePayloadSchema.safeParse(rawPayload);
    if (!result.success) {
      // If Zustand cart data is broken, catch it here!
      console.error("Payload validation failed:", result.error.flatten());
      toast.add({
        type: "error",
        description: "Cart data is invalid. Please refresh and try again.",
        priority: "high",
      });
      return;
    }

    // 3. Use the clean, validated data
    const payload: CreateSalePayload = result.data;

    // 4. Send to backend
    await createEntityPromiseToast({
      data: payload,
      apiCall: createSale,
      entityName: "Create Sale",
      getSuccessMessage: (response) => {
        return `${response.data.sale.invoiceNumber} ${response.message} `;
      },
    });
    setIsPaymentDialogOpen(false);
    resetCart();
    form.reset();
  }
  return (
    <div className="flex h-screen overflow-hidden p-3">
      {/* LEFT SIDE */}
      <div className="w-5/8 h-full flex flex-col overflow-hidden pr-3">
        <ProductHeader setSearchProducts={setSearchProducts} />
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <ProductList searchProducts={searchProducts} />
        </div>
      </div>

      {/* RIGHT SIDE: THE FORM */}
      <form
        id="cart-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-3/8 h-full flex flex-col"
      >
        <Card className="flex-1 flex flex-col overflow-hidden">
          {/* 1. Header (Fixed at top) */}
          <CardHeader className="shrink-0">
            <CartHeader form={form} />
          </CardHeader>

          {/* 2. Content Wrapper (Flex column) */}
          <CardContent className="flex-1 flex flex-col overflow-hidden p-0 min-h-0">
            {/* 3. Cart Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-8">
              <CartItems />
            </div>

            {/* 4. Calculation (Pinned to bottom) */}
            <div className="shrink-0 border-t p-4 bg-background">
              <CartCalculation
                isPaymentDialogOpen={isPaymentDialogOpen}
                setIsPaymentDialogOpen={setIsPaymentDialogOpen}
                form={form}
              />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
export default Pos;
