import express from "express";
import { obtenerFeed,registrarLike,obtenerMeGustaUsuario } from "../Controladores/ControladorImagenes.js";

const router = express.Router();

router.get("/feed",obtenerFeed);
router.post("/like", registrarLike);
router.get("/megustas", obtenerMeGustaUsuario);

export default router;