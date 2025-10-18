// Rutas/rutasCotizacion.js
import express from "express";
import {
  crearCotizacion,
  listarCotizaciones,
  obtenerProgreso,
  listarServicios,
  listarEspacios
} from "../Controladores/ControladorCotizacion.js";

const router = express.Router();
router.get("/servicios", listarServicios);
router.get("/espacios", listarEspacios);
router.post("/crear", crearCotizacion);
router.get("/usuario/:idUsuario", listarCotizaciones);
router.get("/:idCotizacion",obtenerProgreso);



export default router;
