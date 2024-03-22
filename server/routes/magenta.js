import express from "express";
const router = express.Router();
import { checkMagenta } from "../controllers/magenta.js";

router.get("/check", checkMagenta);

export default router;
