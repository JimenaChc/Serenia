
import {
  pagarConSinpe,
  pagarConTarjeta ,
  PaypalClientID,
  crearOrdenPayPal,
  capturarOrdenPayPal
} from "../Servicios/ServicioPagos.js";

export function pagarConSinpeController(req, res) {
console.log("TIPOS:", {
  Id_Cotizacion: typeof req.body.Id_Cotizacion,
  Monto: typeof req.body.Monto,
  Telefono: typeof req.body.Telefono
});

  const { Id_Cotizacion, Monto, Telefono } = req.body;
  if (!Id_Cotizacion || !Monto || !Telefono) {
    return res.status(400).json({ mensaje: "Faltan datos del pago" });
  }
  pagarConSinpe({ Id_Cotizacion: parseInt(Id_Cotizacion), Monto: parseFloat(Monto), Telefono }, (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error interno" });
    }
    if (!resultado.exito) return res.status(400).json(resultado);
    res.json(resultado);
  });
}

export function pagarConTarjetaController(req, res) {
  console.log("BODY RECIBIDO EN EL BACK:", req.body);
console.log("TIPOS:", {
  Id_Cotizacion: typeof req.body.Id_Cotizacion,
  Monto: typeof req.body.Monto,
  NumTarjeta: typeof req.body.NumTarjeta,
  Nombre: typeof req.body.Nombre,
  CVV: typeof req.body.CVV,
  Vencimiento: typeof req.body.Vencimiento,

});
  const { Id_Cotizacion, Monto, NumTarjeta, Nombre, CVV, Vencimiento } = req.body;
  if (!Id_Cotizacion || !Monto || !NumTarjeta || !Nombre || !CVV || !Vencimiento) {
    return res.status(400).json({ mensaje: "Faltan datos del pago" });
  }
  pagarConTarjeta({
    Id_Cotizacion: parseInt(Id_Cotizacion),
    Monto: parseFloat(Monto),
    NumTarjeta,
    Nombre,
    CVV,
    Vencimiento
  }, (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: "Error interno" });
    }
    if (!resultado.exito) return res.status(400).json(resultado);
    res.json(resultado);
  });
}


//Pago con PayPal
export const obtenerPaypalClientId = (req, res) => {
  res.json({ clientId: PaypalClientID() });
};

export const crearOrden = async (req, res) => {
  try {
    const { monto } = req.body;
    const order = await crearOrdenPayPal(monto);
    res.json(order);
  } catch (err) {
    console.log(err.response?.data || err);
    res.status(500).json({ error: "Error creando orden PayPal" });
  }
};

export const CapturarOrden = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "Falta orderId" });
    }

    const data = await capturarOrdenPayPal(orderId);
    res.json(data);
  } catch (err) {
    console.log(err.response?.data || err);
    res.status(500).json({ error: "Error capturando orden PayPal" });
  }
};