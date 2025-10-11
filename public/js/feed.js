let pagina = 1;
let cargando = false;

async function cargarImagenes() {
  if (cargando) return;
  cargando = true;

  const res = await fetch(`/api/imagenes/feed?pagina=${pagina}`);
  const imagenes = await res.json();
  const contenedor = document.getElementById("feed");

  imagenes.forEach((img) => {
    const div = document.createElement("div");
    div.innerHTML = `
      <img 
        data-id="${img.Id_Imagen}" 
        src="${img.Url}" 
        alt="${img.Titulo || ''}" 
        title="${img.Descripcion || ''}"
        class="imagen-feed"
      >
    `;
    contenedor.appendChild(div);
  });

  cargando = false;
  if (imagenes.length > 0) pagina++;
}

//Modal imagen
function inicializarEventosModal() {
  const contenedor = document.getElementById("feed");
  const modal = new bootstrap.Modal(document.getElementById("modalImagen"));

  contenedor.addEventListener("click", (e) => {
    const imagen = e.target.closest(".imagen-feed");
    if (!imagen) return; // Si no se hace clic en una imagen, no hace nada

    // Carga los datos de la imagen en el modal
    const id = imagen.getAttribute("data-id");
    const src = imagen.getAttribute("src");
    const titulo = imagen.getAttribute("alt");
    const descripcion = imagen.getAttribute("title");

    document.getElementById("modalImg").src = src;
    document.getElementById("modalTitulo").textContent = titulo;
    document.getElementById("modalDescripcion").textContent = descripcion;
    document.getElementById("btnLike").setAttribute("data-id", id);
    document.getElementById("btnGuardar").setAttribute("data-id", id);

    modal.show(); // Muestra el modal
  });
}

//Me gusta
async function manejarLike(idImagen) {
  try {
    const res = await fetch("/api/imagenes/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idImagen })
    });
    const data = await res.json();
    alert(data.mensaje || "Imagen marcada con 'Me gusta'");
  } catch (err) {
    console.error(err);
    alert("Error al registrar el 'Me gusta'");
  }
}

// Elegir tablero
async function mostrarSeleccionTablero(idImagen) {
  const idUsuario = 1; // ID del usuario logueado

  const modalTableros = new bootstrap.Modal(document.getElementById("modalSeleccionarTablero"));
  const contenedor = document.getElementById("contenedorTableros");
  contenedor.innerHTML = "<p class='text-center text-muted'>Cargando tus tableros...</p>";

  try {
    const res = await fetch(`/api/tableros/listar/${idUsuario}`);
    const tableros = await res.json();

    contenedor.innerHTML = "";

    if (tableros.length === 0) {
      contenedor.innerHTML = "<p class='text-center text-muted'>Aún no tienes tableros creados.</p>";
    } else {
      tableros.forEach(tablero => {
        const btn = document.createElement("button");
        btn.classList.add("btn", "btn-light", "w-100");
        btn.textContent = tablero.Nombre;
        btn.onclick = async () => {
          await fetch("/api/tableros/guardar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idTablero: tablero.Id_Tableros, idImagen })
          });

          mostrarMensajeFlotante("Imagen guardada correctamente ✅");
          modalTableros.hide();
        };
        contenedor.appendChild(btn);
      });
    }
  } catch (err) {
    contenedor.innerHTML = "<p class='text-danger text-center'>Error al cargar tableros</p>";
  }

  modalTableros.show();
}

//Crear Tablero
document.getElementById("btnMostrarFormNuevo").addEventListener("click", () => {
  document.getElementById("formNuevoTablero").classList.toggle("d-none");
});

document.getElementById("formNuevoTablero").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombreNuevoTablero").value.trim();
  const idUsuario = 1; // cambiar por tu id real
  const idImagen = window.imagenActual || null; // o pásala desde donde abras el modal

  if (!nombre) return mostrarMensajeFlotante(" Escribe un nombre para el tablero.");

  await fetch("/api/tableros/crear", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, idUsuario })
  });

  await fetch("/api/tableros/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, idUsuario, idImagen })
  });

  mostrarMensajeFlotante("Tablero creado e imagen guardada.");
  bootstrap.Modal.getInstance(document.getElementById("modalSeleccionarTablero")).hide();
});


//Guarda tablero
async function manejarGuardar(idImagen) {
  try {
    const res = await fetch("/api/tableros/listar/1"); // ID del usuario logueado
    const tableros = await res.json();

    if (!tableros.length) {
      const crear = confirm("No tienes tableros. ¿Deseas crear uno nuevo?");
      if (crear) {
        const nombre = prompt("Ingresa un nombre para tu nuevo tablero:");
        if (nombre) {
          await fetch("/api/tableros/crear", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, idUsuario: 1 })
          });
          alert("Tablero creado con éxito. Intenta guardar la imagen nuevamente.");
        }
      }
      return;
    }

    const nombres = tableros.map((t, i) => `${i + 1}. ${t.Nombre}`).join("\n");
    const opcion = prompt(`Selecciona un tablero:\n${nombres}`);

    const seleccionado = tableros[parseInt(opcion) - 1];
    if (seleccionado) {
      await fetch("/api/tableros/guardar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idTablero: seleccionado.Id_Tableros, idImagen })
      });
      alert("Imagen guardada correctamente en el tablero.");
    }

  } catch (err) {
    console.error(err);
    alert("Error al guardar la imagen en tablero.");
  }
}

//Eventos
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    cargarImagenes();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  cargarImagenes();
  inicializarEventosModal();

  // Botones dentro del modal
  document.getElementById("btnLike").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    manejarLike(id);
  });

  document.getElementById("btnGuardar").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-id");
    manejarGuardar(id);
  });
});
