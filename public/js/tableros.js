// Contenedores de pantallas
const pantallaTableros = document.getElementById("pantallaTableros");
const contenedorTablerosGrid = document.getElementById("contenedorTablerosGrid");
const btnCerrar= document.getElementById("btnCerrar");
const pantallaImagenesTablero = document.getElementById("pantallaImagenesTablero");
const contenedorImagenesTablero = document.getElementById("contenedorImagenesTablero");
const tituloTablero = document.getElementById("tituloTablero");
const btnVolverTableros = document.getElementById("btnVolverTableros");

// Usuario actual (simulado con localStorage)
const usuario = JSON.parse(localStorage.getItem("usuario"));
const idUsuario = usuario?.Id_Usuario || 1;

// Cargar todos los tableros del usuario
async function cargarTableros() {
  try {
    const res = await fetch(`/api/tableros/listar/${idUsuario}`);
    if (!res.ok) throw new Error("Error al obtener tableros");
    const tableros = await res.json();

    contenedorTablerosGrid.innerHTML = "";

    if (!tableros.length) {
      contenedorTablerosGrid.innerHTML = "<p class='text-center text-muted'>No tienes tableros aún.</p>";
      return;
    }

    for (const tablero of tableros) {
      const card = document.createElement("div");
      card.className = "tablero-card";

      // Creamos un collage con hasta 4 imágenes del tablero
      const previewDiv = document.createElement("div");
      previewDiv.className = "tablero-preview";

      const imgRes = await fetch(`/api/tableros/imagenes/${tablero.Id_Tablero}`);
      const imagenes = imgRes.ok ? await imgRes.json() : [];

      const maxPreviews = 4;
      for (let i = 0; i < maxPreviews; i++) {
        const img = document.createElement("img");
        if (imagenes[i]) {
          img.src = imagenes[i].Url;
        } else {
          img.src = "./img/placeholder.png"; // Imagen de placeholder
        }
        previewDiv.appendChild(img);
      }

      // Nombre del tablero
      const infoDiv = document.createElement("div");
      infoDiv.className = "tablero-info";
      infoDiv.innerHTML = `<h5>${tablero.Titulo}</h5>`;

      card.appendChild(previewDiv);
      card.appendChild(infoDiv);

      // Click para abrir el tablero y mostrar sus imágenes
      card.addEventListener("click", () => abrirTablero(tablero.Id_Tablero, tablero.Titulo));

      contenedorTablerosGrid.appendChild(card);
    }
  } catch (err) {
    console.error(err);
    contenedorTablerosGrid.innerHTML = "<p class='text-center text-danger'>Error al cargar tableros</p>";
  }
}

// Abrir tablero y cargar imágenes
async function abrirTablero(idTablero, titulo) {
  pantallaTableros.classList.add("d-none");
  pantallaImagenesTablero.classList.remove("d-none");
  tituloTablero.textContent = titulo;

  try {
    const res = await fetch(`/api/tableros/imagenes/${idTablero}`);
    if (!res.ok) throw new Error("Error al obtener imágenes del tablero");
    const imagenes = await res.json();

    contenedorImagenesTablero.innerHTML = "";
    if (!imagenes.length) {
      contenedorImagenesTablero.innerHTML = "<p class='text-center text-muted'>No hay imágenes en este tablero.</p>";
      return;
    }

    imagenes.forEach(img => {
      const imagenEl = document.createElement("img");
      imagenEl.src = img.Url;
      imagenEl.alt = img.Titulo || "";
      imagenEl.title = img.Descripcion || "";
      contenedorImagenesTablero.appendChild(imagenEl);
    });
  } catch (err) {
    console.error(err);
    contenedorImagenesTablero.innerHTML = "<p class='text-center text-danger'>Error al cargar imágenes</p>";
  }
}

btnCerrar.addEventListener("click",()=>{
   localStorage.removeItem("usuario");
   window.location.href = "Inicio.html";
});

// Botón volver a pantalla de tableros
btnVolverTableros.addEventListener("click", () => {
  pantallaImagenesTablero.classList.add("d-none");
  pantallaTableros.classList.remove("d-none");
});

// Cargar tableros al inicio
document.addEventListener("DOMContentLoaded", () => {
  cargarTableros();
});
