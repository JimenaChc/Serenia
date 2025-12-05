    const params = new URLSearchParams(window.location.search);
    const idCotizacion = params.get("id");

    const modalPago = new bootstrap.Modal(document.getElementById("modalPago"));
    const toastEl = document.getElementById("toastPago");
    const toast = new bootstrap.Toast(toastEl);
    const mainSection = document.getElementById("mainSection");
    let montoGlobal = 0;
    async function cargarDetalle() {
      try {
        const res = await fetch(`http://localhost:3000/api/cotizaciones/detalle/${idCotizacion}`);
        const data = await res.json();
        const detalle = data[0];
        montoGlobal = detalle.MontoEstimado ? detalle.MontoEstimado * 0.50 : 0;

        document.getElementById("NombreProyecto").textContent = detalle.NombreProyecto || "Proyecto sin nombre";
        document.getElementById("Estado").textContent = detalle.Estado || "Aprobada";

        const progreso = detalle.Estado === "Aprobada" ? 40 :
                         detalle.Estado === "En desarrollo" ? 70 :
                         detalle.Estado === "Terminada" ? 100 : 10;
        document.getElementById("barraProgreso").style.width = progreso + "%";

        if(detalle.Estado === "Aprobada") {
          mostrarSeccionPago(detalle);
        } else if(detalle.Estado === "En desarrollo") {
          mostrarSeccionDesarrollo(detalle);
        } else if(detalle.Estado === "Terminada") {
          mostrarSeccionFinalizada(detalle); 
        }
      } catch(err) {
        console.error("Error al cargar detalle:", err);
      }
    }

    function mostrarSeccionPago(detalle) {
      mainSection.innerHTML = `
        <p><strong>Espacio:</strong> ${detalle.Espacio || "No especificado"}</p>
        <p><strong>Servicio:</strong> ${detalle.Servicio || "No especificado"}</p>
        <p><strong>Descripción:</strong> ${detalle.Descripcion || "Sin descripción"}</p>

        <div id="imagenesContainer" class="imagenes">
          ${detalle.Imagenes ? detalle.Imagenes.split(",").map(url => `<img src="${url.trim()}">`).join("") : ""}
        </div>

        <hr>

        <h6>Detalles de diseño</h6>
        <form id="formDisenio">
          <div class="mb-3">
            <label>Estilo deseado</label>
            <textarea class="form-control" name="EstiloDeseado" rows="2" placeholder="Describe el estilo que deseas...">${detalle.EstiloDeseado || ""}</textarea>
          </div>
          <div class="mb-3">
           <label>Materiales deseados</label>
           <select id="materialesCombo" class="form-select" multiple size="5"></select>
          </div>
          <div class="mb-3">
            <label>Tablero de inspiración</label>
            <select class="form-select" name="Id_Tablero">
              <option value="1" ${detalle.Id_Tablero == 1 ? "selected":""}>Tablero Serenidad</option>
              <option value="2" ${detalle.Id_Tablero == 2 ? "selected":""}>Tablero Naturaleza</option>
              <option value="3" ${detalle.Id_Tablero == 3 ? "selected":""}>Tablero Minimalista</option>
            </select>
          </div>
          <button type="submit" class="btn btn-outline-primary">Guardar detalles</button>
        </form>

        <hr>

        <h6>Pago inicial (50%)</h6>
        <p class="policy">
          Para continuar con el desarrollo, se requiere un pago inicial del 50% del monto total del proyecto. 
          El resto se cancelará al finalizar el diseño. Este pago no es reembolsable.
        </p>

        <button class="btn btn-primary mt-2" id="btnPagar">Realizar pago del 50%</button>
      `;
      cargarMaterialesEnCombo(detalle.Id_Material);
      // Reasignar eventos
      document.getElementById("btnPagar").addEventListener("click", ()=> modalPago.show());
      document.getElementById("formDisenio").addEventListener("submit", guardarDetallesDisenio);
      document.getElementById("formPago")?.addEventListener("submit", enviarPago);
      
      console.log("Monto total recibido:", detalle.MontoEstimado);
      console.log("Monto global calculado:", montoGlobal);

      
    }

function mostrarSeccionDesarrollo(detalle) {
  mainSection.innerHTML = `
    <p><strong>Espacio:</strong> ${detalle.Espacio || "No especificado"}</p>
    <p><strong>Servicio:</strong> ${detalle.Servicio || "No especificado"}</p>

    <h6>Materiales a utilizar</h6>
    <ul id="listaMateriales" class="mb-3"></ul>

    <h6>Galería de progreso</h6>
    <div id="galeriaProgreso" class="row g-2"></div>

    <hr>
<h6>Comentarios</h6>
<div id="comentariosContainer" class="mb-3" style="max-height:250px; overflow-y:auto; border:1px solid #ccc; padding:10px; border-radius:10px; background:#f9f9f9;"></div>

<form id="formComentario" class="d-flex gap-2">
  <input type="text" class="form-control" placeholder="Escribe un comentario..." required />
  <button type="submit" class="btn btn-primary">Enviar</button>
</form>


    <!-- Modal para imagen grande -->
    <div class="modal fade" id="modalImagenGrande" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title" id="tituloImagenModal"></h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img id="imagenModal" src="" style="width:100%; border-radius:12px;">
          </div>
        </div>
      </div>
    </div>
  `;

  const lista = document.getElementById("listaMateriales");
  fetch("http://localhost:3001/api/materiales")
    .then(res => res.json())
    .then(materialesDisponibles => {
      if(Array.isArray(materialesDisponibles[0])) materialesDisponibles = materialesDisponibles[0];

      if(detalle.MaterialesDeseados && materialesDisponibles.length > 0) {
        detalle.MaterialesDeseados.forEach(id => {
          const mat = materialesDisponibles.find(m => Number(m.Id_Material) === Number(id));
          if(mat) {
            const li = document.createElement("li");
            li.textContent = mat.Nombre; // solo nombre
            lista.appendChild(li);
          }
        });
      }
    })

  // Cargar imágenes de progreso desde la API
  fetch(`http://localhost:3000/api/cotizaciones/imagenesProgreso/${detalle.Id_Cotizacion}`)
    .then(res => res.json())
    .then(imagenes => {
      const galeria = document.getElementById("galeriaProgreso");
      imagenes.forEach(img => {
        const col = document.createElement("div");
        col.className = "col-4"; // 3 imágenes por fila
        const imagen = document.createElement("img");
        imagen.src = img.url;
        imagen.alt = img.descripcion || "";
        imagen.style.cursor = "pointer";
        imagen.style.width = "100%";
        imagen.style.borderRadius = "10px";
        imagen.addEventListener("click", () => {
          document.getElementById("imagenModal").src = img.url;
          document.getElementById("tituloImagenModal").textContent = img.descripcion || "";
          const modal = new bootstrap.Modal(document.getElementById("modalImagenGrande"));
          modal.show();
        });
        col.appendChild(imagen);
        galeria.appendChild(col);
      });
    })
    .catch(err => console.error("Error al cargar imágenes de progreso:", err));
}

function mostrarSeccionFinalizada(detalle) {
  mainSection.innerHTML = `
    <p><strong>Espacio:</strong> ${detalle.Espacio || "No especificado"}</p>
    <p><strong>Servicio:</strong> ${detalle.Servicio || "No especificado"}</p>
    <p><strong>Descripción:</strong> ${detalle.Descripcion || "Sin descripción"}</p>

    <h6>Materiales utilizados</h6>
    <ul id="listaMaterialesFinalizados" class="mb-3"></ul>

    <h6>Galería final del proyecto</h6>
    <div id="galeriaFinal" class="row g-2"></div>

    <!-- Modal para imagen grande -->
    <div class="modal fade" id="modalImagenGrande" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h6 class="modal-title" id="tituloImagenModal"></h6>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <img id="imagenModal" src="" style="width:100%; border-radius:12px;">
          </div>
        </div>
      </div>
    </div>
  `;

  // Mostrar materiales
  const lista = document.getElementById("listaMaterialesFinalizados");
  if (detalle.MaterialesDeseados) {
    detalle.MaterialesDeseados.split(",").forEach(mat => {
      const li = document.createElement("li");
      li.textContent = mat.trim();
      lista.appendChild(li);
    });
  }

  // Cargar imágenes finales
  fetch(`http://localhost:3000/api/cotizaciones/imagenesProgreso/${detalle.Id_Cotizacion}`)
    .then(res => res.json())
    .then(imagenes => {
      const galeria = document.getElementById("galeriaFinal");
      imagenes.forEach(img => {
        const col = document.createElement("div");
        col.className = "col-4";
        const imagen = document.createElement("img");
        imagen.src = img.url;
        imagen.alt = img.descripcion || "";
        imagen.style.cursor = "pointer";
        imagen.style.width = "100%";
        imagen.style.borderRadius = "10px";
        imagen.addEventListener("click", () => {
          document.getElementById("imagenModal").src = img.url;
          document.getElementById("tituloImagenModal").textContent = img.descripcion || "";
          const modal = new bootstrap.Modal(document.getElementById("modalImagenGrande"));
          modal.show();
        });
        col.appendChild(imagen);
        galeria.appendChild(col);
      });
    })
    .catch(err => console.error("Error al cargar imágenes finales:", err));
}

    // Funciones de envío
    async function enviarPago(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const datos = Object.fromEntries(formData.entries());
      datos.Id_Cotizacion = idCotizacion;
      datos.Monto = parseFloat(datos.Monto);

      try {
        const res = await fetch("http://localhost:3000/api/cotizaciones/pago", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos)
        });
        const data = await res.json();

        document.getElementById("mensajeToast").textContent = data.mensaje || data.error || "Pago procesado";
        toastEl.className = `toast align-items-center text-white ${res.ok ? "bg-success":"bg-danger"} border-0`;
        toast.show();
        modalPago.hide();
        
        cargarDetalle(); // Actualiza la página al nuevo estado
      } catch(err) {
        document.getElementById("mensajeToast").textContent = "Error al conectar con el servidor";
        toastEl.className = "toast align-items-center text-white bg-danger border-0";
        toast.show();
      }
    }

    async function guardarDetallesDisenio(e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      const datos = Object.fromEntries(formData.entries());
      datos.Id_Cotizacion = idCotizacion;
      const seleccionados = Array.from(document.getElementById("materialesCombo").selectedOptions)
                             .map(o => Number(o.value));
      datos.MaterialesDeseados = seleccionados;

      try {
        const res = await fetch("http://localhost:3000/api/cotizaciones/detallesDisenio", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify(datos)
        });
        const data = await res.json();
        document.getElementById("mensajeToast").textContent = data.mensaje || data.error || "Guardado";
        toastEl.className = `toast align-items-center text-white ${res.ok ? "bg-success":"bg-danger"} border-0`;
        toast.show();
      } catch(err) {
        document.getElementById("mensajeToast").textContent = "Error al conectar con el servidor";
        toastEl.className = "toast align-items-center text-white bg-danger border-0";
        toast.show();
      }
    }

    // Inicial
    cargarDetalle();

async function cargarMaterialesEnCombo(seleccionados = []) {
  const combo = document.getElementById("materialesCombo");
  if (!combo) return;

  try {
    const res = await fetch("http://localhost:3001/api/materiales");
    const data = await res.json();

    const materiales = Array.isArray(data[0]) ? data[0] : data;

    combo.innerHTML = "";

    materiales.forEach(mat => {
      const option = document.createElement("option");
      option.value = mat.Id_Material;
      option.textContent = `${mat.Nombre} - ${mat.Tipo} - ₡${mat.Precio}`;
      if (seleccionados.includes(mat.Id_Material)) {
        option.selected = true;
      }

      combo.appendChild(option);
    });

  } catch (err) {
    console.error("Error al cargar materiales:", err);
    combo.innerHTML = `<option>Error al cargar materiales</option>`;
  }
}

    async function cargarComentarios() {
    const cont = document.getElementById("comentariosContainer");
       if (!cont) {
    console.warn("No hay contenedor de comentarios en esta sección.");
    return;
  }
  try {
    const res = await fetch(`http://localhost:3000/api/cotizaciones/comentarios/${idCotizacion}`);
    const comentarios = await res.json();

    const cont = document.getElementById("comentariosContainer");
    cont.innerHTML = ""; // limpiar antes de renderizar

    comentarios.forEach(c => {
      const div = document.createElement("div");
      div.style.marginBottom = "8px";
      div.style.padding = "6px 10px";
      div.style.borderRadius = "12px";
      div.style.maxWidth = "80%";
      div.style.wordWrap = "break-word";

      if(c.tipo === "usuario") {
        div.style.background = "#d1e7dd";
        div.style.alignSelf = "flex-start";
      } else {
        div.style.background = "#cfe2ff";
        div.style.alignSelf = "flex-end";
      }

      div.textContent = `${c.emisor}: ${c.mensaje}`;
      cont.appendChild(div);
    });

    cont.scrollTop = cont.scrollHeight;
  } catch(err) {
    console.error("Error al cargar comentarios:", err);
  }
}

// Evento para enviar comentario
document.getElementById("formComentario")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = e.target.querySelector("input");
  const mensaje = input.value.trim();
  if(!mensaje) return;

  try {
    const res = await fetch("http://localhost:3000/api/cotizaciones/comentario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Id_Cotizacion: idCotizacion, mensaje, tipo: "usuario" }) // tipo "usuario" o "disenador"
    });
    const data = await res.json();
    if(res.ok) {
      input.value = "";
      cargarComentarios(); // refrescar
    }
  } catch(err) {
    console.error("Error al enviar comentario:", err);
  }
});

// Llamar al cargar la sección
cargarComentarios();


function mostrarMensaje(texto) {
    const msg = document.createElement("div");
    msg.className = "mensaje-flotante show";
    msg.innerText = texto;

    document.body.appendChild(msg);

    setTimeout(() => msg.remove(), 2500);
}