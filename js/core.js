function iniciarCatalogo(config) {
    const sheetURL = config.sheetURL;
    const tipo = config.tipo || "fragancias";

    /* ============================= */
    /* CONFIG GLOBAL */
    /* ============================= */
    const cloudName = "dvzdwcr5m";
    const numeroWhatsApp = "573126161008";
    const imagenDefault = "https://res.cloudinary.com/dvzdwcr5m/image/upload/w_600,q_auto,f_webp/sinfoto";

    /* ============================= */
    /* CONFIG POR CATÁLOGO */
    /* ============================= */
    const catalogosConfig = {
        fragancias: {
            textoBusqueda: "Buscar fragancia...",
            campoPrincipal: "Coleccion",
            filtroSelect: {
                id: "filtroCasa",
                campo: "Casa",
                placeholder: "Todas las casas"
            },
            camposBusqueda: ["Nombre", "Casa", "Familia"],
            renderCard: (p) => `
        <img src="${p.imagenUrl}"
          class="img-producto"
          alt="${p.Nombre}"
          onerror="this.onerror=null; this.src='${imagenDefault}'">

        <h3>${p.Nombre || ""}</h3>

        <div class="casa-perfume">
          ${p.Casa || ""}
        </div>

        <div class="familia-olfativa">
          ${p.Familia || ""}
        </div>

        <div class="precio">
          ${formatoPrecio(p.Detal)}
        </div>

        <button class="btn-agregar">
          Agregar al carrito
        </button>
      `
        },

        apparel: {
            textoBusqueda: "Buscar producto...",
            campoPrincipal: "Genero",
            filtroSelect: {
                id: "filtroMarca",
                campo: "Marca",
                placeholder: "Todas las marcas"
            },
            camposBusqueda: ["Nombre", "Marca", "Categoria", "Genero"],
            renderCard: (p) => `
        <img src="${p.imagenUrl}"
          class="img-producto"
          alt="${p.Nombre}"
          onerror="this.onerror=null; this.src='${imagenDefault}'">

        <h3>${p.Nombre || ""}</h3>

        <div class="casa-perfume">
          ${p.Marca || ""}
        </div>

        <div class="familia-olfativa">
          ${p.Categoria || ""}
        </div>

        <div class="precio">
          ${formatoPrecio(p.Detal)}
        </div>

        <button class="btn-agregar">
          Agregar al carrito
        </button>
      `
        },

        calzado: {
            textoBusqueda: "Buscar calzado...",
            campoPrincipal: "Genero",
            filtroSelect: {
                id: "filtroMarca",
                campo: "Marca",
                placeholder: "Todas las marcas"
            },
            camposBusqueda: ["Nombre", "Marca", "Categoria", "Genero"],
            renderCard: (p) => `
        <img src="${p.imagenUrl}"
          class="img-producto"
          alt="${p.Nombre}"
          onerror="this.onerror=null; this.src='${imagenDefault}'">

        <h3>${p.Nombre || ""}</h3>

        <div class="casa-perfume">
          ${p.Marca || ""}
        </div>

        <div class="familia-olfativa">
          ${p.Categoria || ""}
        </div>

        <div class="precio">
          ${formatoPrecio(p.Detal)}
        </div>

        <button class="btn-agregar">
          Agregar al carrito
        </button>
      `
        },

        sport: {
            textoBusqueda: "Buscar producto sport...",
            campoPrincipal: "coleccion", // 👈 aquí cambia la lógica de botones
            filtroSelect: null, // 👈 en esta página no tienes select de marca
            camposBusqueda: ["Nombre", "Marca", "Categoria"],
            filtrosMapa: {
                sport: "sport",
                ligas: "ligas",
                club: "ligas",
                seleccion: "seleccion",
                varios: "varios"
            },
            renderCard: (p) => `
            <img src="${p.imagenUrl}"
            class="img-producto"
            alt="${p.Nombre}"
            onerror="this.onerror=null; this.src='${imagenDefault}'">

            <h3>${p.Nombre || ""}</h3>

            <div class="precio">
            ${formatoPrecio(p.Detal)}
            </div>

            <button class="btn-agregar">
            Agregar al carrito
            </button>
            `
        },
    foxlab: {
            textoBusqueda: "Buscar producto...",
            campoPrincipal: "Coleccion",
            filtroSelect: null,
            camposBusqueda: ["Nombre", "Coleccion"],
            renderCard: (p) => `
      <img src="${p.imagenUrl}"
        class="img-producto"
        alt="${p.Nombre}"
        onerror="this.onerror=null; this.src='${imagenDefault}'">

      <h3>${p.Nombre || ""}</h3>

      <div class="familia-olfativa">
        ${p.Coleccion || ""}
      </div>

      <div class="precio">
        ${formatoPrecio(p.Detal)}
      </div>

      <button class="btn-agregar">
        Agregar al carrito
      </button>
    `
        }

    };

    const catalogo = catalogosConfig[tipo];
    if (!catalogo) {
        console.error(`No existe configuración para el catálogo tipo "${tipo}"`);
        return;
    }

    /* ============================= */
    /* ESTADO */
    /* ============================= */
    let productosGlobal = [];
    let productosFiltrados = [];
    let carrito = JSON.parse(localStorage.getItem(`carrito_${tipo}`)) || [];

    let filtros = {
        principal: "todas",   // hombre / mujer / unisex / todas / promo
        select: "todas",      // casa o marca
        promo: false,
        busqueda: ""
    };

    let paginaActual = 1;
    const productosPorPagina = 20;

    let imagenBase = "";
    let indexImagen = 0;
    let cargando = false;

    /* ============================= */
    /* HELPERS */
    /* ============================= */
    const $ = (id) => document.getElementById(id);

    function limpiarTexto(texto) {
        return (texto || "")
            .toString()
            .trim()
            .toLowerCase();
    }

    function formatoPrecio(valor) {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(Number(valor) || 0);
    }

    function mostrarLoader() {
        $("loader")?.classList.add("activo");
    }

    function ocultarLoader() {
        $("loader")?.classList.remove("activo");
    }

    function guardarCarrito() {
        localStorage.setItem(`carrito_${tipo}`, JSON.stringify(carrito));
    }

    function obtenerCategoriaDesdeURL() {
        const params = new URLSearchParams(window.location.search);
        return limpiarTexto(params.get("categoria"));
    }

    /* ============================= */
    /* TOUCH MODAL */
    /* ============================= */
    let touchstartX = 0;
    let touchendX = 0;

    const modalElem = $("modalImagen");
    if (modalElem) {
        modalElem.addEventListener("touchstart", e => {
            touchstartX = e.changedTouches[0].screenX;
        }, { passive: true });

        modalElem.addEventListener("touchend", e => {
            touchendX = e.changedTouches[0].screenX;
            const diferencia = touchstartX - touchendX;

            if (Math.abs(diferencia) > 50) {
                if (diferencia > 0) {
                    imagenSiguiente();
                } else {
                    imagenAnterior();
                }
            }
        }, { passive: true });
    }

    $("modalImagen")?.addEventListener("click", function (e) {
        if (e.target.id === "modalImagen") {
            cerrarModal();
        }
    });

    /* ============================= */
    /* CARGA DE PRODUCTOS */
    /* ============================= */
    async function fetchProductos() {
        const res = await fetch(sheetURL);
        const csv = await res.text();

        const lines = csv.trim().split("\n");
        const headers = lines.shift().split(",");

        return lines.map((line, index) => {
            const values = line.split(",");
            let obj = {};

            headers.forEach((h, i) => {
                obj[h.trim()] = values[i]?.trim();
            });

            obj.id = index;
            obj.Detal = parseInt((obj.Detal || "0").replace(/\./g, "").replace(/,/g, "")) || 0;
            obj.Mayor = parseInt((obj.Mayor || "0").replace(/\./g, "").replace(/,/g, "")) || 0;
            obj.imagenUrl = obj.Imagen
                ? `https://res.cloudinary.com/${cloudName}/image/upload/w_600,q_auto,f_webp/${obj.Imagen}`
                : imagenDefault;

            return obj;
        });
    }

    /* ============================= */
    /* FILTRO SELECT DINÁMICO */
    /* ============================= */
    function cargarFiltroSelect() {
        if (!catalogo.filtroSelect) return;

        const select = catalogo.filtroSelect?.id ? $(catalogo.filtroSelect.id) : null;
        if (!select) return;

        select.innerHTML = `<option value="todas">${catalogo.filtroSelect.placeholder}</option>`;

        const campo = catalogo.filtroSelect.campo;

        const valores = [
            ...new Set(
                productosGlobal
                    .map(p => p[campo])
                    .filter(Boolean)
            )
        ].sort();

        valores.forEach(valor => {
            const option = document.createElement("option");
            option.value = limpiarTexto(valor);
            option.textContent = valor;
            select.appendChild(option);
        });
    }

    /* ============================= */
    /* REGLAS FILTRO PRINCIPAL */
    /* ============================= */
    function coincideFiltroPrincipal(producto) {
        const valorFiltro = filtros.principal;
        const campo = catalogo.campoPrincipal;
        const valorProducto = limpiarTexto(producto[campo] || producto.Coleccion);

        if (valorFiltro === "todas") return true;
        if (valorFiltro === "promo") return true;

        // ===== FRAGANCIAS =====
        if (tipo === "fragancias") {
            if (valorFiltro === "fem" || valorFiltro === "dama" || valorFiltro === "mujer") {
                return ["fem", "unisex"].includes(valorProducto);
            }

            if (valorFiltro === "masc" || valorFiltro === "hombre") {
                return ["masc", "unisex"].includes(valorProducto);
            }

            if (valorFiltro === "unisex") {
                return valorProducto === "unisex";
            }

            return valorProducto === valorFiltro;
        }

        // ===== APPAREL / CALZADO =====
        if (tipo === "apparel" || tipo === "calzado") {
            if (valorFiltro === "hombre") {
                return ["hombre", "unisex", "masc"].includes(valorProducto);
            }

            if (valorFiltro === "mujer" || valorFiltro === "dama") {
                return ["mujer", "dama", "unisex", "fem"].includes(valorProducto);
            }

            if (valorFiltro === "unisex") {
                return valorProducto === "unisex";
            }

            return valorProducto === valorFiltro;
        }

        // ===== SPORT =====
        // Aquí el filtro es por Categoria: sport, ligas, seleccion, varios
        if (tipo === "sport") {

            const mapa = catalogo.filtrosMapa || {};

            const valorReal = mapa[valorFiltro] || valorFiltro;

            return valorProducto === valorReal;
        }

        return valorProducto === valorFiltro;
    }

    /* ============================= */
    /* MOTOR DE FILTROS */
    /* ============================= */
    function aplicarFiltros() {
        productosFiltrados = productosGlobal.filter(producto => {
            const coincidePrincipal = coincideFiltroPrincipal(producto);

            let coincideSelect = true;

            if (catalogo.filtroSelect?.campo) {
                const campoSelect = catalogo.filtroSelect.campo;
                const valorSelectProducto = limpiarTexto(producto[campoSelect]);

                coincideSelect =
                    filtros.select === "todas" ||
                    valorSelectProducto === filtros.select;
            }
            const coincideBusqueda =
                !filtros.busqueda ||
                catalogo.camposBusqueda.some(campo =>
                    limpiarTexto(producto[campo]).includes(filtros.busqueda)
                );

            const promoValue = limpiarTexto(producto.Promo);
            const coincidePromo =
                !filtros.promo ||
                ["y", "yes", "1", "true", "si", "sí"].includes(promoValue);

            return coincidePrincipal && coincideSelect && coincideBusqueda && coincidePromo;
        });

        paginaActual = 1;
        renderPagina();
    }

    /* ============================= */
    /* FILTRO POR BOTONES */
    /* ============================= */
    function mostrarProductos(valor = "todas", boton = null) {
        const limpio = limpiarTexto(valor);

        if (limpio === "promo") {
            filtros.principal = "todas";
            filtros.promo = true;
        } else {
            filtros.principal = limpio;
            filtros.promo = false;
        }

        if (boton) {
            document.querySelectorAll(".colecciones button")
                .forEach(btn => btn.classList.remove("active"));
            boton.classList.add("active");
        }

        aplicarFiltros();
    }

    /* ============================= */
    /* RENDER */
    /* ============================= */
    function renderPagina() {
        const cont = $("productos");
        const paginacion = $("paginacion");
        const btnAnterior = $("btnAnterior");
        const btnSiguiente = $("btnSiguiente");
        const infoPagina = $("infoPagina");

        if (!cont) return;
        cont.innerHTML = "";

        if (!productosFiltrados.length) {
            cont.innerHTML = `
        <div class="sin-resultados">
        Oops... No encontramos ningún producto.
        <img class="sad" src="/assets/sad.png" alt="sad">
      </div>
      `;
            if (paginacion) paginacion.style.display = "none";
            return;
        }

        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        const inicio = (paginaActual - 1) * productosPorPagina;
        const fin = inicio + productosPorPagina;

        productosFiltrados.slice(inicio, fin).forEach(p => {
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = catalogo.renderCard(p);

            card.querySelector(".img-producto")
                ?.addEventListener("click", () => abrirModal(p.Imagen));

            card.querySelector(".btn-agregar")
                ?.addEventListener("click", e => agregarAlCarrito(p, e.target));

            cont.appendChild(card);
        });

        if (paginacion) {
            paginacion.style.display = totalPaginas <= 1 ? "none" : "flex";
        }

        if (infoPagina) infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;
        if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
        if (btnSiguiente) btnSiguiente.disabled = paginaActual === totalPaginas;
    }

    /* ============================= */
    /* PAGINACIÓN */
    /* ============================= */
    function paginaSiguiente() {
        if (paginaActual * productosPorPagina < productosFiltrados.length) {
            paginaActual++;
            renderPagina();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function paginaAnterior() {
        if (paginaActual > 1) {
            paginaActual--;
            renderPagina();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    /* ============================= */
    /* MODAL */
    /* ============================= */
    function abrirModal(imgId) {
        if (!imgId) return;
        imagenBase = imgId;
        indexImagen = 0;
        actualizarImagenModal();
        $("modalImagen")?.classList.add("activo");
        document.body.classList.add("modal-abierto");
    }

    function cerrarModal() {
        $("modalImagen")?.classList.remove("activo");
        document.body.classList.remove("modal-abierto");
    }

    function obtenerNombreImagen() {
        return indexImagen === 0 ? imagenBase : `${imagenBase}${indexImagen}`;
    }

    function actualizarImagenModal() {
        const nombre = obtenerNombreImagen();
        if ($("imagenGrande")) {
            $("imagenGrande").src =
                `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,q_auto,f_webp/${nombre}`;
        }
    }

    function imagenSiguiente() {
        if (cargando) return;
        cargando = true;

        const siguienteIndex = indexImagen + 1;
        const nombre = siguienteIndex === 0 ? imagenBase : `${imagenBase}${siguienteIndex}`;
        const url = `https://res.cloudinary.com/${cloudName}/image/upload/${nombre}`;

        const img = new Image();
        img.onload = () => {
            indexImagen = siguienteIndex;
            if ($("imagenGrande")) $("imagenGrande").src = url;
            cargando = false;
        };

        img.onerror = () => {
            indexImagen = 0;
            if ($("imagenGrande")) {
                $("imagenGrande").src =
                    `https://res.cloudinary.com/${cloudName}/image/upload/${imagenBase}`;
            }
            cargando = false;
        };

        img.src = url;
    }

    function imagenAnterior() {
        if (indexImagen > 0) {
            indexImagen--;
            actualizarImagenModal();
        }
    }

    /* ============================= */
    /* CARRITO */
    /* ============================= */
    function agregarAlCarrito(producto, boton) {
        const existente = carrito.find(p => p.id === producto.id);

        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }

        guardarCarrito();
        actualizarCarritoUI();
        animarBoton(boton);
    }

    function animarBoton(boton) {
        if (!boton) return;

        const texto = boton.innerText;
        boton.innerText = "Agregado ✓";
        boton.disabled = true;

        setTimeout(() => {
            boton.innerText = texto;
            boton.disabled = false;
        }, 1200);
    }

    function eliminarProducto(id) {
        carrito = carrito.filter(p => p.id !== id);
        guardarCarrito();
        actualizarCarritoUI();
    }

    function cambiarCantidad(id, cambio) {
        const item = carrito.find(p => p.id === id);
        if (!item) return;

        item.cantidad += cambio;

        if (item.cantidad <= 0) {
            eliminarProducto(id);
            return;
        }

        guardarCarrito();
        actualizarCarritoUI();
    }

    function actualizarCarritoUI() {
        const lista = $("listaCarrito");
        const contador = $("contadorCarrito");
        const totalSpan = $("totalCarrito");

        if (!lista) return;

        lista.innerHTML = "";
        let total = 0;
        let totalItems = 0;

        carrito.forEach(item => {
            total += item.Detal * item.cantidad;
            totalItems += item.cantidad;

            lista.innerHTML += `
        <div class="item-carrito">
          <img src="${item.imagenUrl || imagenDefault}">
          <div class="item-info">
            <h4>${item.Nombre}</h4>
            <div class="precio">${formatoPrecio(item.Detal * item.cantidad)}</div>

            <div class="controles-cantidad">
              <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
              <span>${item.cantidad}</span>
              <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
            </div>

            <button onclick="eliminarProducto(${item.id})">Eliminar</button>
          </div>
        </div>
      `;
        });

        if (contador) contador.textContent = totalItems;
        if (totalSpan) totalSpan.textContent = formatoPrecio(total);
    }

    /* ============================= */
    /* PANEL CARRITO */
    /* ============================= */
    function abrirCarrito() {
        $("carritoPanel")?.classList.add("activo");
        $("carritoOverlay")?.classList.add("activo");
    }

    function cerrarCarrito() {
        $("carritoPanel")?.classList.remove("activo");
        $("carritoOverlay")?.classList.remove("activo");
    }

    $("carritoicon")?.addEventListener("click", abrirCarrito);

    /* ============================= */
    /* WHATSAPP */
    /* ============================= */
    function enviarPedidoWhatsApp() {
        if (!carrito.length) {
            alert("Tu carrito está vacío");
            return;
        }

        let mensaje = `Hola Foxlab Co 👋\n\nPedido de ${tipo}:\n\n`;
        let total = 0;

        carrito.forEach(item => {
            const subtotal = item.Detal * item.cantidad;
            total += subtotal;

            mensaje += `• ${item.Nombre}\nCantidad: ${item.cantidad}\nSubtotal: ${formatoPrecio(subtotal)}\n\n`;
        });

        mensaje += `Total: ${formatoPrecio(total)}\n\nMi nombre es:`;

        window.open(
            `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
            "_blank"
        );

        carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        cerrarCarrito();
    }

    /* ============================= */
    /* INIT */
    /* ============================= */
    (async function init() {
        try {
            mostrarLoader();

            productosGlobal = await fetchProductos();

            const inputBusqueda = $("busqueda");
            if (inputBusqueda) {
                inputBusqueda.placeholder = catalogo.textoBusqueda;
                inputBusqueda.addEventListener("input", e => {
                    filtros.busqueda = limpiarTexto(e.target.value);
                    aplicarFiltros();
                });
            }

            cargarFiltroSelect();

            const select = catalogo.filtroSelect?.id ? $(catalogo.filtroSelect.id) : null;
            if (select) {
                select.addEventListener("change", e => {
                    filtros.select = limpiarTexto(e.target.value);
                    aplicarFiltros();
                });
            }

            const categoriaURL = obtenerCategoriaDesdeURL();
            if (categoriaURL && categoriaURL !== "todas") {
                mostrarProductos(categoriaURL);
            } else {
                aplicarFiltros();
            }

            actualizarCarritoUI();
            ocultarLoader();

        } catch (err) {
            console.error("Error cargando productos:", err);
            ocultarLoader();
        }
    })();

    /* ============================= */
    /* EXPONER FUNCIONES */
    /* ============================= */
    window.mostrarProductos = mostrarProductos;
    window.paginaSiguiente = paginaSiguiente;
    window.paginaAnterior = paginaAnterior;
    window.cerrarCarrito = cerrarCarrito;
    window.cambiarCantidad = cambiarCantidad;
    window.eliminarProducto = eliminarProducto;
    window.enviarPedidoWhatsApp = enviarPedidoWhatsApp;
    window.imagenSiguiente = imagenSiguiente;
    window.imagenAnterior = imagenAnterior;
    window.cerrarModal = cerrarModal;
}