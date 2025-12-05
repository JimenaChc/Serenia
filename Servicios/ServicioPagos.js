// Servicios/pagosService.js
import paypalClient from "../Config/paypal.js";
import checkoutNodeJssdk from "@paypal/checkout-server-sdk";
import axios from "axios";
import dotenv from "dotenv";
import {
  buscarTarjetaPorTelefono,
  buscarTarjetaPorNumero,
  descontarSaldo,
  registrarPagoDB,
  actualizarEstadoCotizacion,
} from "../Datos/DatosPagos.js";

const PAYPAL_API = "https://api-m.sandbox.paypal.com"; 
const CLIENT_ID = process.env.PAYPAL_API_CLIENT;
const SECRET = process.env.PAYPAL_API_SECRET;

export function pagarConSinpe({ Id_Cotizacion, Monto, Telefono }, cb) {
  const idCot = parseInt(Id_Cotizacion, 10);
  const montoPago = parseFloat(Monto);
  const tel = String(Telefono);

  buscarTarjetaPorTelefono(tel, (err, tarjetas) => {
    if (err) return cb(err);
    if (!tarjetas || tarjetas.length === 0) {
      return cb(null, { exito: false, mensaje: "No existe tarjeta asociada a ese teléfono" });
    }

    const tarjeta = tarjetas[0];

    descontarSaldo(tarjeta.NumTarjeta, montoPago, (err2, estado) => {
      if (err2) return cb(err2);

      if (estado === "OK") {
        registrarPagoDB(idCot, montoPago, "SINPE Móvil", (err3) => {
          if (err3) return cb(err3);

          actualizarEstadoCotizacion(idCot, "En desarrollo", (err4) => {
            if (err4) return cb(err4);

            return cb(null, {
              exito: true,
              mensaje: "Pago por SINPE realizado correctamente",
              metodo: "SINPE Móvil",
            });
          });
        });
        return;
      }

      if (estado === "SALDO_INSUFICIENTE") {
        return cb(null, { exito: false, mensaje: "Saldo insuficiente en la cuenta" });
      }

      if (estado === "NO_EXISTE") {
        return cb(null, { exito: false, mensaje: "No se encontró una tarjeta asociada a este teléfono" });
      }

      return cb(null, { exito: false, mensaje: "Error desconocido" });
    });
  });
}



export function pagarConTarjeta({ Id_Cotizacion, Monto, NumTarjeta, Nombre, CVV, Vencimiento }, cb) {
  buscarTarjetaPorNumero(NumTarjeta, (err, tarjetas) => {
    if (err) return cb(err);
    if (!tarjetas || tarjetas.length === 0) {
      return cb(null, { exito: false, mensaje: "Tarjeta no encontrada" });
    }
    const tarjeta = tarjetas[0];
    // validaciones
    if ((tarjeta.CodigoSeguridad || tarjeta.CVV) && String(tarjeta.CodigoSeguridad) !== String(CVV)) {
      return cb(null, { exito: false, mensaje: "CVV incorrecto" });
    }
    if (tarjeta.Nombre && tarjeta.Nombre !== Nombre) {
      return cb(null, { exito: false, mensaje: "Nombre titular incorrecto" });
    }
    if (tarjeta.Vencimiento && tarjeta.Vencimiento !== Vencimiento) {
      return cb(null, { exito: false, mensaje: "Fecha de vencimiento incorrecta" });
    }

    descontarSaldo(NumTarjeta, Monto, (err2, resultadoSP) => {
      if (err2) return cb(err2);
      if (resultadoSP !== "OK") {
        const msg = resultadoSP === "SALDO_INSUFICIENTE" ? "Saldo insuficiente" : "Error al descontar saldo";
        return cb(null, { exito: false, mensaje: msg });
      }
      registrarPagoDB(Id_Cotizacion, Monto, "Tarjeta", (err3) => {
        if (err3) return cb(err3);
        actualizarEstadoCotizacion(Id_Cotizacion, "En desarrollo", (err4) => {
          if (err4) return cb(err4);
          cb(null, { exito: true, mensaje: "Pago con tarjeta realizado", metodo: "Tarjeta" });
        });
      });
    });
  });
}

export const PaypalClientID = () => CLIENT_ID;

// Crear orden
export const crearOrdenPayPal = async (monto) => {
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");

    const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders`,
        {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: monto.toString(),
                    },
                },
            ],
        },
        {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};

// Capturar orden
export const capturarOrdenPayPal = async (orderId) => {
    const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");

    const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
};