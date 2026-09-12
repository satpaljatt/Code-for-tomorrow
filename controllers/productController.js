import mongoose from "mongoose";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";

// @desc    Create a new product
// @route   POST /products
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product name and price are required",
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Product price must be greater than zero",
      });
    }

    if (stock !== undefined && Number(stock) < 0) {
      return res.status(400).json({
        success: false,
        message: "Product stock cannot be negative",
      });
    }

    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product name must be unique",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price,
      stock: stock || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the product",
      error: error.message,
    });
  }
};

// @desc    Get all products
// @route   GET /products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching products",
      error: error.message,
    });
  }
};

// @desc    Purchase a product
// @route   POST /products/purchase
export const purchaseProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase quantity must be greater than zero",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
      });
    }

    if (Number(quantity) > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available stock is ${product.stock}`,
      });
    }

    product.stock -= Number(quantity);
    await product.save();

    const transaction = await Transaction.create({
      product: product._id,
      type: "PURCHASE",
      quantity: Number(quantity),
    });

    return res.status(200).json({
      success: true,
      message: "Purchase successful",
      data: { product, transaction },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while processing the purchase",
      error: error.message,
    });
  }
};

// @desc    Restock a product
// @route   POST /products/restock
export const restockProduct = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Restock quantity must be greater than zero",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
      });
    }

    product.stock += Number(quantity);
    await product.save();

    const transaction = await Transaction.create({
      product: product._id,
      type: "RESTOCK",
      quantity: Number(quantity),
    });

    return res.status(200).json({
      success: true,
      message: "Restock successful",
      data: { product, transaction },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while processing the restock",
      error: error.message,
    });
  }
};

// @desc    Get purchase/restock history of a product
// @route   GET /products/:productId/history
export const getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Valid productId is required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product does not exist",
      });
    }

    const history = await Transaction.find({ product: productId }).sort({
      transactionDate: -1,
    });

    return res.status(200).json({
      success: true,
      product: product.name,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching product history",
      error: error.message,
    });
  }
};
