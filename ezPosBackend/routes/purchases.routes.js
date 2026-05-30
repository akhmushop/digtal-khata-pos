import express from "express";
import { pool } from "../config/db.js";
const router = express.Router()
router.post("/api/purchases", async(req, res)=>{
    console.log(req.body.purchasesCart)
})
export default router