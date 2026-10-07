import { useState } from "react";
import { ProductHeader } from "@/features/pos/components/pos/ProductHeader.js";
import { ProductList } from "@/features/pos/components/pos/ProductList.js";
import { CartHeader } from "@/features/pos/components/pos/CartHeader.js";
import CartItems, {
  CartCalculation,
} from "@/features/pos/components/pos/CartItems.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cartSchema, CartSchemaType } from "./schemas/cart.schema.js";
import { useCartStore } from "@/store/useCartStore.js";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.js";
function Pos() {
  const { cart } = useCartStore();
  const [searchProducts, setSearchProducts] = useState("");
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

  async function onSubmit(data: CartSchemaType) {
    console.log({ ...data, cart });
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
              <CartCalculation form={form} />
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
export default Pos;
