import fetch from "node-fetch";
import { parseStringPromise } from "xml2js";

function obtenerFechaFormatoBCCR() {
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const anio = hoy.getFullYear();
  return `${dia}/${mes}/${anio}`;
}

export async function obtenerTipoCambioBCCR() {
  try {
    const fecha = obtenerFechaFormatoBCCR();

    const url = `https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicosXML?Indicador=318&FechaInicio=${fecha}&FechaFinal=${fecha}&Nombre=${process.env.BCCR_NOMBRE}&CorreoElectronico=${process.env.BCCR_CORREO}&Token=${process.env.BCCR_TOKEN}&SubNiveles=N`;

    const response = await fetch(url);
    const xml = await response.text();
    const externo = await parseStringPromise(xml);
    const xmlEscapado = externo.string._;

    const xmlReal = xmlEscapado
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&");
    const interno = await parseStringPromise(xmlReal);

    const valor =
      interno.Datos_de_INGC011_CAT_INDICADORECONOMIC.INGC011_CAT_INDICADORECONOMIC[0].NUM_VALOR[0];

    return Number(valor);

  } catch (error) {
    console.error("Error en Servicio BCCR:", error);
    throw error;
  }
}
