document.addEventListener("DOMContentLoaded", async () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.Id_Usuario;

  if (!idUsuario) {
    alert("Usuario no identificado");
    return;
  }

  try {
    const res = await fetch(`/api/cotizaciones/usuario/${idUsuario}`);
    const cotizacionesData = await res.json();
    const cotizaciones = cotizacionesData[0] || [];

    const lista = document.getElementById("listaCotizaciones");
    lista.innerHTML = "";

    cotizaciones.forEach(c => {
      const imagenes = c.Imagenes ? c.Imagenes.split(",") : [];

      const div = document.createElement("div");
      div.className = "cotizacion-card";
      div.innerHTML = `
        <div class="cotizacion-imagenes">
          ${imagenes.map(url => `<img src="${url}" alt="imagen">`).join("")}
        </div>
        <div class="cotizacion-info">
          <h3>${c.NombreProyecto}</h3>
          <p>${c.Descripcion}</p>
          <p><strong>Monto:</strong> ₡${c.MontoEstimado}</p>
          <p class="cotizacion-estado">Estado: ${c.Estado}</p>
        </div>
      `;
      div.addEventListener("click",()=>{
        window.location.href =`ProgresoProyectos.html?id=${c.Id_Cotizacion}`;
      });
      lista.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    alert("Error al cargar cotizaciones");
  }
});
