import { Router } from "express";
import {
 pagarConSinpeController,
  pagarConTarjetaController,
  obtenerPaypalClientId,
  crearOrden,
  CapturarOrden
} from "../Controladores/ControladorPagos.js";

const router = Router();

router.post("/sinpe", pagarConSinpeController);
router.post("/tarjeta", pagarConTarjetaController);
router.get("/paypal/client-id", obtenerPaypalClientId);
router.post("/paypal/crear-orden",crearOrden);
router.post("/paypal/capturar-orden",CapturarOrden);



export default router;
