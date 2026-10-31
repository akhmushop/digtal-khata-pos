import { NextRequest } from "next/server";

interface Variant {
  id: number;
  price: number;
  availability: number;
}
interface Product {
  id: number;
  name: string;
  description: string | null;
  variants: Variant[];
}

export default async function StorefrontPage() {
  const res = await fetch(
    `${process.env.EZPOS_API_URL}/api/v1/storefront/products`,
    {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_EZPOS_PUBLISHABLE_KEY}`,
      },
      next: { revalidate: 60 }, // availability is re-checked at checkout
    },
  );
  const { products } = (await res.json()) as { products: Product[] };

  return (
    <main>
      <h1>Our shop</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h2>{product.name}</h2>
            {product.variants.map((variant) => (
              <p key={variant.id}>
                {variant.sku} — {variant.price} BDT —{" "}
                {variant.availability > 0
                  ? `${variant.availability} in stock`
                  : "out of stock"}
              </p>
            ))}
          </li>
        ))}
      </ul>
    </main>
  );
}
