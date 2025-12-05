
const ENDPOINTS = {
    muebles: "http://localhost:3001/api/muebles",
    lamparas: "http://localhost:3001/api/lamparas",
    disenadores: "http://localhost:3001/api/disenadores/disenadores"
};


const feed = document.getElementById("feed");

async function cargarCatalogo(tipoCatalogo) {
    try {
        feed.innerHTML = `<p class="text-center mt-3">Cargando ${tipoCatalogo}...</p>`;
        const res = await fetch(ENDPOINTS[tipoCatalogo]);
        let data = await res.json();
        data = data[0];

        feed.innerHTML = "";

        if (!data || !data.length) {
            feed.innerHTML = `<p class="text-center mt-3">No hay elementos en este catálogo.</p>`;
            return;
        }

        feed.classList.remove("disenadores");

        if(tipoCatalogo === "disenadores") {
            feed.classList.add("disenadores");
        }

        data.forEach(item => {
            const div = document.createElement("div");
            if (tipoCatalogo === "disenadores") {
                div.classList.add("card-disenador");
                div.innerHTML = `
                    <img src="${item.ImagenUrl}" class="card-img-top" alt="${item.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${item.Nombre}</h5>
                        <p class="card-text"><strong>Especialidad:</strong> ${item.Especialidad}</p>
                        <p class="card-text"><strong>Experiencia:</strong> ${item.Experiencia} años</p>
                        <p class="card-text">${item.Descripcion}</p>
                    </div>
                `;
            } else {
                div.classList.add("feed-item");
                div.innerHTML = `
                    <img src="${item.imagen || item.ImagenUrl || item.url}" 
                         alt="${item.nombre || item.Nombre}" 
                         class="feed-img" 
                         data-info='${JSON.stringify(item)}'>
                    <p class="feed-titulo">${item.nombre || item.Nombre}</p>
                `;

                div.querySelector("img").addEventListener("click", (e) => {
                    const info = JSON.parse(e.target.getAttribute("data-info"));
                    abrirModalCatalogo(info);
                });
            }

            feed.appendChild(div);
        });

    } catch (error) {
        console.error("Error cargando catálogo:", error);
        feed.innerHTML = `<p class="text-center text-danger mt-3">Error al cargar los datos.</p>`;
    }
}

function abrirModalCatalogo(item) {
    const modalImg = document.getElementById("modalImg");
    const modalTitulo = document.getElementById("modalTitulo");
    const modalDescripcion = document.getElementById("modalDescripcion");

    modalImg.src = item.imagen || item.ImagenUrl || item.url;
    modalTitulo.textContent = item.nombre || item.Nombre;
    modalDescripcion.textContent = `
        Precio: ${item.precio || item.Precio || "N/A"}
        ${item.descripcion || item.Descripcion || ""}
    `;

    const modal = new bootstrap.Modal(document.getElementById("modalImagen"));
    modal.show();
}


document.getElementById("btnMuebles").addEventListener("click", () => cargarCatalogo("muebles"));
document.getElementById("btnLamparas").addEventListener("click", () => cargarCatalogo("lamparas"));
document.getElementById("btnDisenadores").addEventListener("click", () => cargarCatalogo("disenadores"));
