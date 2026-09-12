import express from "express";
import {
  createProduct,
  getProducts,
  purchaseProduct,
  restockProduct,
  getProductHistory,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.post("/purchase", purchaseProduct);
router.post("/restock", restockProduct);
router.get("/:productId/history", getProductHistory);

export default router;
