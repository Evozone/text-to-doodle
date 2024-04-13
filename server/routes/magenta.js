import express from "express";
const router = express.Router();
import { checkMagenta } from "../controllers/magenta.js";
import { postStrokes } from "../controllers/magenta.js";

router.get("/check", checkMagenta);
router.post("/strokes", postStrokes);

export default router;
