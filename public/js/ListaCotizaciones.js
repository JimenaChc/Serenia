document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario;

  if (!idUsuario) {
    alert("Usuario no identificado");
    return;
  }

  const lista = document.getElementById("listaCotizaciones");
  lista.innerHTML = `<p style="text-align:center;">Cargando cotizaciones...</p>`;

  try {
    const res = await fetch(`/api/cotizaciones/usuario/${idUsuario}`);
    const cotizacionesData = await res.json();
    const cotizaciones = cotizacionesData[0] || [];

    lista.innerHTML = "";

    if (cotizaciones.length === 0) {
      lista.innerHTML = `<p class="sin-cotizaciones">Aún no tienes cotizaciones</p>`;
      return;
    }
    const tipoCambio = await cargarTipoCambio();
   
    cotizaciones.forEach(c => {
      const imagenes = c.Imagenes ? c.Imagenes.split(",") : [];
      const montoColones = c.MontoEstimado;
      const montoDolares = tipoCambio 
      ? (montoColones / tipoCambio).toFixed(2)
      : "N/A";


      const div = document.createElement("div");
      div.className = "cotizacion-card";
      div.innerHTML = `
        <div class="cotizacion-imagenes">
          ${imagenes.map(url => `<img loading="lazy" src="${url}" alt="imagen">`).join("")}
        </div>
        <div class="cotizacion-info">
          <h3>${c.NombreProyecto}</h3>
          <p>${c.Descripcion}</p>
          <p><strong>Monto en colones:</strong> ₡${c.MontoEstimado}</p>
          <p><strong>Monto en dolares:</strong> $${montoDolares} </p>
          <p class="cotizacion-estado">Estado: ${c.Estado}</p>
        </div>
      `;

      div.addEventListener("click", () => {
        window.location.href = `ProgresoProyectos.html?id=${c.Id_Cotizacion}`;
      });

      lista.appendChild(div);
    });

  } catch (error) {
    console.error(error);
    lista.innerHTML = `<p class="sin-cotizaciones">Error al cargar</p>`;
  }
});

async function cargarTipoCambio() {
  try {
    const response = await fetch("http://localhost:3000/api/tipoCambio");
    const data = await response.json();
    return data.tipoCambio;
  } catch (error) {
    console.error("Error cargando TC:", error);
    return null;
  }
}

