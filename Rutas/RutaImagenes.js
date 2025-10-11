import express from "express";
import { obtenerFeed } from "../Controladores/ControladorImagenes.js";

const router = express.Router();

router.get("/feed",obtenerFeed);

export default router;