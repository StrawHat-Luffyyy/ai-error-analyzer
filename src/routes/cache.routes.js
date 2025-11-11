import express from "express";
import { getCacheStats } from "../controllers/cache.controller.js";
const router = express.Router();

router.get("/", getCacheStats);

export default router;
