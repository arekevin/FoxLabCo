/* ============================= */
/* CONFIG */
/* ============================= */

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTs-DZxNCoO7-hnJJNLioavfzWAOlNzj0TqARTMiU1MN5dQIdpzXC4Es7uxGCc-UsKwHg1lzSTfsif6/pub?gid=0&single=true&output=csv";
const cloudName = "dvzdwcr5m";
const numeroWhatsApp = "573126161008";

let paginaActual = 1;
const productosPorPagina = 20;

let productosGlobal = [];

/* ============================= */
/* FETCH */
/* ============================= */

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

    obj.Precio = parseInt(obj.Precio) || 0;

    return obj;
  });
}

/* ============================= */
/* FILTROS */
/* ============================= */

function llenarFiltros(productos) {

  const marcaSet = new Set();

  productos.forEach(p => {
    if (p.Marca) marcaSet.add(p.Marca);
  });

  const filtroMarca = $("filtroMarca");

  marcaSet.forEach(marca => {
    const option = document.createElement("option");
    option.value = marca;
    option.textContent = marca;
    filtroMarca.appendChild(option);
  });
}

function obtenerFiltrados() {

  const categoria = $("filtroCategoria").value;
  const marca = $("filtroMarca").value;
  const genero = $("filtroGenero").value;

  let filtrados = productosGlobal.filter(p => {

    const categoriaOK =
      categoria === "todos" || p.Categoria === categoria;

    const marcaOK =
      marca === "todos" || p.Marca === marca;

    let generoOK = true;

    if (genero !== "todos") {

      if (genero === "Hombre" || genero === "Dama") {
        generoOK =
          p.Genero === genero ||
          p.Genero === "Unisex";
      } else {
        generoOK = p.Genero === genero;
      }

    }

    return categoriaOK && marcaOK && generoOK;
  });

  /* ORDENAMIENTO 🔥 */

  const orden = $("ordenar")?.value;

  if (orden === "precio-asc") {
    filtrados.sort((a, b) => a.Precio - b.Precio);
  }

  if (orden === "precio-desc") {
    filtrados.sort((a, b) => b.Precio - a.Precio);
  }

  if (orden === "nombre") {
    filtrados.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
  }

  return filtrados;
}

/* ============================= */
/* RENDER */
/* ============================= */

function mostrarProductos() {

  const cont = $("productos");
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
      <img src="https://res.cloudinary.com/${cloudName}/image/upload/${p.Imagen}" alt="${p.Nombre}">
      <h3>${p.Nombre}</h3>
      <p>${p.Genero}</p>
      <div class="precio">${formatoPrecio(p.Precio)}</div>
      <a class="btn"
         href="https://wa.me/${numeroWhatsApp}?text=Hola, quiero el producto ${encodeURIComponent(p.Nombre)}"
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

/* ============================= */
/* PAGINACIÓN */
/* ============================= */

function actualizarPaginacion(totalPaginas) {

  $("infoPagina").textContent =
    `Página ${paginaActual} de ${totalPaginas}`;

  $("btnAnterior").disabled =
    paginaActual === 1;

  $("btnSiguiente").disabled =
    paginaActual === totalPaginas;

  const paginacion = $("paginacion");

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

/* ============================= */
/* INIT */
/* ============================= */

(async () => {

  try {

    productosGlobal = await fetchProductos();

    llenarFiltros(productosGlobal);

    ["filtroCategoria", "filtroMarca", "filtroGenero", "ordenar"]
      .forEach(id => {
        $(id)?.addEventListener("change", () => {
          paginaActual = 1;
          mostrarProductos();
        });
      });

    mostrarProductos();

  } catch (error) {
    console.error("Error cargando productos:", error);
  }

})();