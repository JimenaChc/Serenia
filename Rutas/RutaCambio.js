import express from "express";
import { TipoCambio } from "../Controladores/ControladorTipoCambio.js";

const router = express.Router();

router.get("/", TipoCambio);
export default router;
