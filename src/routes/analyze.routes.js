import express from "express";
import { analyzeError } from "../controllers/analyze.controller.js";

const router = express.Router();

router.post("/", analyzeError);

export default router;
