const urlEndpoint = "https://localhost:7036/Sale";
const contenedorVentas = document.getElementById("ventas-lista");
const inputFecha = document.getElementById("fecha-busqueda");
const botonBuscar = document.getElementById("btn-buscar");

// Función para cargar las ventas desde el endpoint usando una fecha específica
async function cargarVentasDesdeFecha(fecha) {
    try {
        const urlConFecha = `${urlEndpoint}?from=${encodeURIComponent(fecha)}`;
        const response = await fetch(urlConFecha);
        if (!response.ok) {
            throw new Error("Error al cargar las ventas");
        }
        const ventas = await response.json();
        mostrarVentas(ventas);
    } catch (error) {
        console.error("Error:", error);
    }
}

// Función para manejar la búsqueda cuando se hace clic en el botón
function handleBuscarClick() {
    const fechaBusqueda = inputFecha.value;
    if (fechaBusqueda) {
        cargarVentasDesdeFecha(fechaBusqueda);
    } else {
        console.error("Por favor ingresa una fecha válida");
    }
}

// Función para mostrar las ventas en el HTML
function mostrarVentas(ventas) {
    contenedorVentas.innerHTML = ""; // Limpiar el contenido previo

    ventas.forEach(venta => {
        const fechaVenta = new Date(venta.date);
        const fechaFormateada = `${fechaVenta.getDate()}/${fechaVenta.getMonth() + 1}/${fechaVenta.getFullYear()}`;

        const div = document.createElement("div");
        div.classList.add("carrito-producto");
        div.innerHTML = `
            <i class="bi bi-receipt"></i>
            <div class="carrito-producto-detalle">
                <div class="carrito-producto-nombre">Venta ID: ${venta.id}</div>
                <div class="carrito-producto-cantidad">Total: $${venta.totalPay.toFixed(2)}</div>
                <div class="carrito-producto-precio">Cantidad de Productos: ${venta.totalQuantity}</div>
                <div class="carrito-producto-subtotal">Fecha: ${fechaFormateada}</div>
            </div>
        `;
        contenedorVentas.append(div);
    });
}

// Evento para manejar la búsqueda cuando se hace clic en el botón
botonBuscar.addEventListener("click", handleBuscarClick);