import React, { useState } from "react";
import Sidebar from "../../components/layout/Sidebar.js";
import { ProductHeader } from "@/features/pos/components/pos/ProductHeader.js";
import { ProductList } from "@/features/pos/components/pos/ProductList.js";
import { CartHeader } from "@/features/pos/components/pos/CartHeader.js";
import CartItems from "@/features/pos/components/pos/CartItems.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cartSchema, CartSchemaType } from "./schemas/cart.schema.js";
import { useCartStore } from "@/store/useCartStore.js";
function Pos({}) {
  const [searchProducts, setSearchProducts] = useState("");
    const {
      cart
    } = useCartStore();
  const form = useForm<CartSchemaType>({
    resolver: zodResolver(cartSchema),
    defaultValues: {
      saleDate: new Date(),
      customerId: null,
      payments: [],
      discount:{}
    },
  });
  async function onSubmit(data: CartSchemaType) {
    console.log({...data,cart});
  }
  console.log(form.formState.errors)
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-5/8">
        <ProductHeader setSearchProducts={setSearchProducts} />
        <ProductList searchProducts={searchProducts} />
      </div>

      <form
        id="cart-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-3/8"
      >
        <CartHeader form={form} />
        <CartItems form={form} />
      </form>
    </div>
  );
}
export default Pos;
