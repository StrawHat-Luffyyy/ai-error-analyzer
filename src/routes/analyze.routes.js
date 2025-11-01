import express from "express";
import { analyzeError } from "../controllers/analyze.controller.js";

const router = express.Router();

router.post("/analyze", analyzeError);

export default router;
