import express from "express";
import { pool } from "./config/db.js";
import productRouter from "./routes/products.routes.js";
import cartRouter from "./routes/cart.routes.js";
import salesRouter from "./routes/sales.routes.js";
import cors from "cors";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", salesRouter);
// routes

const PORT = 3000;

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
