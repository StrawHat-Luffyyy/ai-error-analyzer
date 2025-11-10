import express from "express";
import { getSystemHealth } from "../controllers/health.controller.js";

const router = express.Router();
router.get("/", getSystemHealth);
export default router;
