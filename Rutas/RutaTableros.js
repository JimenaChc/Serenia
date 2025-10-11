import express from "express";
import { crearTableroController, listarTablerosController, guardarImagenController } from "../Controladores/ControladorTableros.js";
const router = express.Router();

router.post("/crear", crearTableroController);         
router.get("/listar/:idUsuario", listarTablerosController); 
router.post("/guardar", guardarImagenController);         

export default router;
