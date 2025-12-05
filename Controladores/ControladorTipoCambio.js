import { obtenerTipoCambioBCCR } from "../Servicios/ServicioCambioDolar.js";

export async function TipoCambio(req, res) {
  try {
    const tipoCambio = await obtenerTipoCambioBCCR();
    res.json({ tipoCambio });
  } catch (e) {
    res.status(500).json({ error: "Error obteniendo TC del BCCR" });
  }
}
