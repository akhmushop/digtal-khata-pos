import express from "express";
import { pool } from "./config/db.js";
import productRouter from "./routes/products.routes.js";
import salesRouter from "./routes/sales.routes.js";
import customersRouter from "./routes/customers.routes.js";
import cors from "cors";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
app.use("/", productRouter);
app.use("/", salesRouter);
app.use("/", customersRouter);
// routes

const PORT = 3000;

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
