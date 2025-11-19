document.addEventListener("DOMContentLoaded", () => {
  cargarPaises();

  document.getElementById("pais").addEventListener("change", function () {
    cargarProvincias(this.value);
  });

  document.getElementById("provincia").addEventListener("change", function () {
    cargarCantones(this.value);
  });

  document.getElementById("canton").addEventListener("change", function () {
    cargarDistritos(this.value);
  });
});

async function cargarPaises() {
  const res = await fetch("/api/usuarios/paises");
  const data = await res.json();
  llenarSelect("pais", data, "Seleccione un país");
}

async function cargarProvincias(idPais) {
  if (!idPais) return;
  const res = await fetch(`/api/usuarios/hijos/${idPais}`);
  const data = await res.json();
  llenarSelect("provincia", data, "Seleccione una provincia");
  habilitar("provincia");
  deshabilitar("canton");
  deshabilitar("distrito");
}

async function cargarCantones(idProvincia) {
  if (!idProvincia) return;
  const res = await fetch(`/api/usuarios/hijos/${idProvincia}`);
  const data = await res.json();
  llenarSelect("canton", data, "Seleccione un cantón");
  habilitar("canton");
  deshabilitar("distrito");
}

async function cargarDistritos(idCanton) {
  if (!idCanton) return;
  const res = await fetch(`/api/usuarios/hijos/${idCanton}`);
  const data = await res.json();
  llenarSelect("distrito", data, "Seleccione un distrito");
  habilitar("distrito");
}

function llenarSelect(id, datos, placeholder) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  datos.forEach(x => {
    const op = document.createElement("option");
    op.value = x.Id;
    op.textContent = x.Descripcion;
    sel.appendChild(op);
  });
}

function habilitar(id) {
  document.getElementById(id).disabled = false;
}

function deshabilitar(id) {
  const sel = document.getElementById(id);
  sel.innerHTML = `<option value="">Seleccione una opción</option>`;
  sel.disabled = true;
}