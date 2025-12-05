document.addEventListener("DOMContentLoaded", () => {
  const formSinpe = document.getElementById("formSinpe");

  formSinpe.addEventListener("submit", async (e) => {
    e.preventDefault();


    const Telefono = document.getElementById("telefonoSinpe").value;

    const body = {
      Id_Cotizacion: idCotizacion,
      Monto: montoGlobal,
      Telefono
    };

    try {

      const res = await fetch("http://localhost:3000/api/pagos/sinpe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

    if (!data.exito) {
    mostrarMensaje(data.mensaje);
    return;
}

      mostrarMensaje("Pago realizado correctamente");
      bootstrap.Modal.getInstance(document.getElementById("modalSinpe"))?.hide();
      cargarDetalle();

    } catch (err) {
      console.error("Error en SINPE:", err);
    }
  });
});


// --- PAGAR CON TARJETA ---
document.getElementById("formTarjeta").addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    Id_Cotizacion: idCotizacion,
    Monto: document.getElementById("Monto").value,
    NumTarjeta: document.getElementById("tarjetaNumero").value,
    Nombre: document.getElementById("tarjetaNombre").value,
    CVV: document.getElementById("tarjetaCVV").value,
    Vencimiento: document.getElementById("tarjetaVencimiento").value
  };

  try {
    const res = await fetch("http://localhost:3000/api/pagos/tarjeta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    console.log(data);

    if (!res.ok) {
      mostrarMensaje("Error: " + (data.mensaje || "No se pudo procesar el pago"));
      return;
    }

    mostrarMensaje("Pago realizado correctamente!");
    bootstrap.Modal.getInstance(document.getElementById("modalTarjeta"))?.hide();
    cargarDetalle();

  } catch (err) {
    console.error("Error en Tarjeta:", err);
  }
});


async function cargarPaypalSdk() {
    const res = await fetch("http://localhost:3000/api/pagos/paypal/client-id");
    const data = await res.json();
    const clientId = data.clientId;

    if (!clientId) {
        console.error("No se encontró el Client ID en backend");
        return;
    }

    // script dinámico
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&disable-funding=card`;
    script.onload = inicializarBotonPaypal;

    document.body.appendChild(script);
}

function inicializarBotonPaypal() {
    paypal.Buttons({
        createOrder: async () => {
            const response = await fetch("http://localhost:3000/api/pagos/paypal/crear-orden", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ monto: montoGlobal })
            });
            const order = await response.json();
            return order.id;
        },
        onApprove: async (data) => {
            const res = await fetch("http://localhost:3000/api/pagos/paypal/capturar-orden", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID })
            });

            const result = await res.json();
            alert("Pago realizado correctamente");
            console.log(result);
        }
    }).render("#paypal-button-container");
  }

cargarPaypalSdk();