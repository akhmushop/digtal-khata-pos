import express from "express";
import { pool } from "./db.js";
import cors from "cors";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
// routes

const PORT = 3000;
app.get("/api/products", async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM products");
    res.json(products.rows);
  } catch (err) {
    console.err(err);
  }
});
app.post("/api/products", async (req, res) => {
  try {
    const product = req.body;
    const keys = Object.keys(product);
    const values = Object.values(product);
    const columns = keys.join(",");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    const newProduct = await pool.query(
      `INSERT INTO products (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    const updateProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    const removeProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/add/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity + 1;
    const addProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity, quantity } = req.body;
    const updatedQuantity = quantity + sold_quantity;
    const restoreProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/custom/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { new_quantity, prev_quantity, products_quantity } = req.body;
    const updatedQuantity = products_quantity - (new_quantity - prev_quantity);
    const addCustomProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/restore_all/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity, products_quantity } = req.body;
    const updatedQuantity = products_quantity + sold_quantity;
    const restoreProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/update_stock/:id", async (req, res) => {
  const { id } = req.params;
  const { newStock, status } = req.body;
  const insertNewStock = await pool.query(
    "UPDATE products SET quantity = $1, status = $2 WHERE id = $3",
    [newStock, status, id],
  );
  res.json(id);
});
app.delete("/api/products/remove_product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await pool.query(
      "DELETE FROM products WHERE id = $1",
      [id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.post("/api/products/duplicate-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    const keys = Object.keys(product).filter((p) => p !== "id");
    const values = Object.values(product);
    const copyColumns = keys
      .map((p) => {
        if (p === "product_name") {
          return (p = "product_name || '(copy)'");
        } else if (p === "barcode") p = "barcode || '(copy)'";
        return p;
      })
      .join(",");
    const columns = keys.join(",");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    const newProduct = await pool.query(
      `INSERT INTO products (${columns})  SELECT ${copyColumns}  FROM products WHERE id = $1`,
      [id],
    );
    // res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
//
//
//
//
//
app.get("/api/cart", async (req, res) => {
  try {
    const cart = await pool.query("SELECT * FROM cart");
    res.json(cart.rows);
  } catch (err) {
    console.error(err);
  }
});
app.post("/api/cart", async (req, res) => {
  const cart = req.body;
  const keys = Object.keys(cart);
  const values = Object.values(cart);
  const columns = keys.join(",");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
  const addToCart = await pool.query(
    `INSERT INTO cart (${columns}) VALUES (${placeholders}) `,
    values,
  );
});
app.put("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const increaseQuantity = quantity + 1;
    const updatedQuantity = await pool.query(
      "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
      [increaseQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const removeCartItem = await pool.query("DELETE FROM cart WHERE id = $1", [
      id,
    ]);
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/cart/add/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity } = req.body;
    const updatedQuantity = sold_quantity + 1;
    const addCartQuantity = await pool.query(
      "UPDATE  cart SET sold_quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/cart/remove/:id", async (req, res) => {
  const { id } = req.params;
  const { sold_quantity } = req.body;
  const updatedQuantity = sold_quantity - 1;
  const updateCartQuantity = await pool.query(
    "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
    [updatedQuantity, id],
  );
});
app.put("/api/cart/custom/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity } = req.body;
    const updateCustomCartQuantity = await pool.query(
      "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
      [sold_quantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
app.delete("/api/cart/reset/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resetCart = await pool.query("DELETE FROM cart ");
  } catch (err) {
    console.error(err);
  }
});
app.delete("/api/cart/remove_cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const removeCartItem = await pool.query("DELETE FROM cart WHERE id = $1", [
      id,
    ]);
  } catch (err) {
    console.error(err);
  }
});
//
//
//
//
//
//
app.get("/api/sold_products", async (req, res) => {
  try {
    const sold_products = await pool.query(
      "SELECT s.id AS sale_id ,p.id,p.product_name,p.category, p.cost, p.price ,si.sold_quantity, si.sold_price, s.created_at FROM sale_items si JOIN sales s ON si.sale_id = s.id JOIN products p ON si.product_id = p.id",
    );
    res.json(sold_products.rows);
  } catch (err) {
    console.error(err);
  }
});
app.post("/api/sold_products", async (req, res) => {
  try {
    const cart = req.body;
    console.log(cart);
    const insertSale = await pool.query(
      "INSERT INTO sales DEFAULT VALUES RETURNING id",
    );
    const salesId = insertSale.rows[0].id;
    console.log();
    for (let item of cart) {
      const insertSoldProducts = await pool.query(
        "INSERT INTO sale_items (sale_id, product_id, quantity, price) VALUES ($1,$2,$3,$4)",
        [salesId, item.id, item.sold_quantity, item.price],
      );
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
