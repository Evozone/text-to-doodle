import express from "express";
import { googleSignUp } from "../controllers/user.js";
const router = express.Router();

router.post("/googleSignUp", googleSignUp);

export default router;
