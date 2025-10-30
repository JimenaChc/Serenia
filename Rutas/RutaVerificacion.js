// Rutas/rutasVerificacion.js
import express from "express";
import { enviarVerificacion, verificarToken, completarRegistro } from "../Controladores/ControladorVerificacion.js";

const router = express.Router();

router.post("/enviar", enviarVerificacion);
router.get("/validar/:token", verificarToken);
router.post("/completar", completarRegistro);

export default router;
