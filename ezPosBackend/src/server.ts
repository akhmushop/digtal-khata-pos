import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { pool } from "./config/db.js";
import productRouter from "./modules/products/products.routes.js";
import salesRouter from "./modules/sales/sales.routes.js";
import customersRouter from "./modules/customers/customers.routes.js";
import expenseRouter from "./modules/expenses/expenses.routes.js";
import purchasesRouter from "./modules/purchases/purchases.routes.js";
import purchasesReturnRouter from "./modules/purchaseReturn/purchaseReturn.routes.js";
import addProductRouter from "./modules/addProduct/product.routes.js";
import cors from "cors";
import { NotFoundError } from "./utils/handleError.js";
import { success } from "zod";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
app.use("/", productRouter);
app.use("/", salesRouter);
app.use("/", customersRouter);
app.use("/", expenseRouter);
app.use("/", purchasesRouter);
app.use("/", purchasesReturnRouter);
app.use("/", addProductRouter);
// routes
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof NotFoundError) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});
const PORT = 3000;

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
