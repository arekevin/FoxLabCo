const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTs-DZxNCoO7-hnJJNLioavfzWAOlNzj0TqARTMiU1MN5dQIdpzXC4Es7uxGCc-UsKwHg1lzSTfsif6/pub?gid=0&single=true&output=csv";
const cloudName = "dvzdwcr5m";

let paginaActual = 1;
const productosPorPagina = 20;

let productosGlobal = [];

async function fetchProductos() {
  const res = await fetch(sheetURL);
  const csvText = await res.text();

  const lines = csvText.trim().split("\n");
  const headers = lines.shift().split(",");

  return lines.map(line => {
    const values = line.split(",");
    let obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim();
    });
    return obj;
  });
}

function llenarFiltros(productos) {
  const marcaSet = new Set();
  productos.forEach(p => {
    if (p.Marca) marcaSet.add(p.Marca);
  });

  const filtroMarca = document.getElementById("filtroMarca");

  marcaSet.forEach(marca => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    filtroMarca.appendChild(option);
  });
}

function obtenerFiltrados() {

  const cat = document.getElementById("filtroCategoria").value;
  const mar = document.getElementById("filtroMarca").value;
  const gen = document.getElementById("filtroGenero").value;

  return productosGlobal.filter(p =>
    (cat === "todos" || p.Categoria === cat) &&
    (mar === "todos" || p.Marca === mar) &&
    (gen === "todos" || p.Genero === gen)
  );
}

function mostrarProductos() {

  const cont = document.getElementById("productos");
  cont.innerHTML = "";

  const filtrados = obtenerFiltrados();

  const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;

  const paginaProductos = filtrados.slice(inicio, fin);

  paginaProductos.forEach(p => {

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="https://res.cloudinary.com/${cloudName}/image/upload/v1771981588/${p.Imagen}" alt="${p.Nombre}">
      <h3>${p.Nombre}</h3>
      <p>${p.Marca}</p>
      <p>${p.Genero}</p>
      <div class="precio">$${parseInt(p.Precio || 0).toLocaleString()}</div>
      <a class="btn"
         href="https://wa.me/573126161008?text=Hola, quiero el producto ${encodeURIComponent(p.Nombre)}"
         target="_blank">
         Comprar
      </a>
    `;

    cont.appendChild(card);
  });

  actualizarPaginacion(totalPaginas);
  window.scrollTo({
  top: 0,
  behavior: "smooth"
});
}

function actualizarPaginacion(totalPaginas) {

  document.getElementById("infoPagina").textContent =
    `Página ${paginaActual} de ${totalPaginas}`;

  document.getElementById("btnAnterior").disabled =
    paginaActual === 1;

  document.getElementById("btnSiguiente").disabled =
    paginaActual === totalPaginas;

  const paginacion = document.getElementById("paginacion");

  if (totalPaginas <= 1) {
    paginacion.style.display = "none";
  } else {
    paginacion.style.display = "flex";
  }
}

function paginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    mostrarProductos();
  }
}

function paginaSiguiente() {
  const total = Math.ceil(obtenerFiltrados().length / productosPorPagina);

  if (paginaActual < total) {
    paginaActual++;
    mostrarProductos();
  }
}

(async () => {

  try {

    productosGlobal = await fetchProductos();

    llenarFiltros(productosGlobal);

    document.getElementById("filtroCategoria")
      .addEventListener("change", () => {
        paginaActual = 1;
        mostrarProductos();
      });

    document.getElementById("filtroMarca")
      .addEventListener("change", () => {
        paginaActual = 1;
        mostrarProductos();
      });

    document.getElementById("filtroGenero")
      .addEventListener("change", () => {
        paginaActual = 1;
        mostrarProductos();
      });

    mostrarProductos();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }

})();