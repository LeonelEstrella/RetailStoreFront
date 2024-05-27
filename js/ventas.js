const urlEndpoint = "https://localhost:7036/Sale";
const contenedorVentas = document.getElementById("ventas-lista");
const inputFechaInicio = document.getElementById("fecha-inicio");
const inputFechaFin = document.getElementById("fecha-fin");
const botonBuscar = document.getElementById("btn-buscar");
const spinner = document.getElementById('spinner-no-background');

// Función para mostrar el spinner
function mostrarSpinner() {
    spinner.classList.remove('hidden');
    spinner.classList.add('visible');
}

// Función para ocultar el spinner
function ocultarSpinner() {
    spinner.classList.remove('visible');
    spinner.classList.add('hidden');
}

// Función para cargar las ventas desde el endpoint usando un rango de fechas
async function cargarVentasDesdeFechas(fechaInicio, fechaFin) {
    mostrarSpinner();
    try {
        // Construir la URL condicionalmente
        let urlConFechas = urlEndpoint;
        const params = [];

        if (fechaInicio) {
            params.push(`from=${encodeURIComponent(fechaInicio)}`);
        }
        if (fechaFin) {
            params.push(`to=${encodeURIComponent(fechaFin)}`);
        }

        if (params.length > 0) {
            urlConFechas += '?' + params.join('&');
        }

        console.log(urlConFechas);
        const response = await fetch(urlConFechas);
        if (!response.ok) {
            if (response.status === 400) {
                Swal.fire({
                    icon: "error",
                    title: "Error al realizar la búsqueda",
                    text: "La fecha de inicio no puede ser mayor a la fecha de fin.",
                    customClass: {
                        popup: 'custom-alert'
                    }
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error al cargar las ventas",
                    text: "Vuelva a intentar realizar la búsqueda por favor.",
                    customClass: {
                        popup: 'custom-alert'
                    }
                });
            }
            throw new Error("Error al cargar las ventas");
        }

        const ventas = await response.json();
        if (ventas.length === 0) {
            Swal.fire({
                icon: "info",
                title: "Sin ventas",
                text: "No se encontraron ventas en las fechas especificadas.",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Confirmar",
                customClass: {
                    popup: 'custom-alert'
                }
            });
        } else {
            mostrarVentas(ventas);
        }
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            icon: "error",
            title: "Error al cargar las ventas",
            text: "Vuelva a intentarlo la búsqueda en unos minutos por favor.",
            customClass: {
                popup: 'custom-alert'
            }
        });
    } finally {
        ocultarSpinner();
    }
}

function handleBuscarClick() {
    const fechaInicio = inputFechaInicio.value;
    const fechaFin = inputFechaFin.value;

    // Llamar a la función para cargar las ventas, pasando las fechas según estén disponibles
    cargarVentasDesdeFechas(fechaInicio || null, fechaFin || null);
}

// Función para mostrar las ventas en el HTML
function mostrarVentas(ventas) {
    contenedorVentas.innerHTML = ""; // Limpiar el contenido previo

    ventas.forEach(venta => {
        const fechaVenta = new Date(venta.date);
        const fechaFormateada = `${fechaVenta.getDate()}/${fechaVenta.getMonth() + 1}/${fechaVenta.getFullYear()}`;

        const div = document.createElement("div");
        div.classList.add("venta-producto");
        div.dataset.id = venta.id;

        // Generar IDs únicos para los botones y modales
        const modalId = `modal-${venta.id}`;
        const btnAbrirModalId = `btn-abrir-modal-${venta.id}`;
        const btnCerrarModalId = `btn-cerrar-modal-${venta.id}`;

        div.innerHTML = `
            <i class="bi bi-receipt"></i>
            <div class="venta-producto-detalle">
                <div class="carrito-producto-nombre">Venta N°${venta.id}</div>
                <div class="carrito-producto-cantidad">Total: $${venta.totalPay.toFixed(2)}</div>
                <div class="carrito-producto-precio">Cantidad de Productos: ${venta.totalQuantity}</div>
                <div class="carrito-producto-subtotal">Fecha: ${fechaFormateada}</div>
                <button class="btn-ver-detalle-venta" id="${btnAbrirModalId}">Ver detalles</button>
                <dialog id="${modalId}">
                    <h2 class="titulo-principal">Detalles venta: ${venta.id}</h2>
                    <div class="venta-detalles"></div> <!-- Contenedor para los detalles de la venta -->
                    <button class="btn-cerrar-modal" id="${btnCerrarModalId}">Cerrar ventana</button>
                </dialog>
            </div>
        `;
        contenedorVentas.append(div);

        // Seleccionar el modal y los botones específicos de esta venta
        const btnAbrirModal = document.getElementById(btnAbrirModalId);
        const btnCerrarModal = document.getElementById(btnCerrarModalId);
        const modal = document.getElementById(modalId);
        const detallesDiv = modal.querySelector(".venta-detalles");

        btnAbrirModal.addEventListener("click", async () => {
            await cargarDetallesVenta(venta.id, detallesDiv);
            modal.showModal();
        });

        btnCerrarModal.addEventListener("click", () => {
            modal.close();
        });

        // Evento para cerrar el modal al hacer clic fuera de él
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    });
}

// Función para cargar los detalles de una venta específica desde el endpoint
async function cargarDetallesVenta(saleId, detallesDiv) {
    try {
        const response = await fetch(`${urlEndpoint}/${saleId}`);
        if (!response.ok) {
            throw new Error("Error al cargar los detalles de la venta");
        }
        const venta = await response.json();
        mostrarDetallesVenta(venta, detallesDiv);
    } catch (error) {
        console.error("Error:", error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar el detalle de la venta. Intente nuevamente en unos minutos.',
            icon: 'error',
            customClass: {
                popup: 'custom-alert'
            }
        });
    }
}

// Función para mostrar los detalles de la venta dentro del div correspondiente
function mostrarDetallesVenta(venta, detallesDiv) {
    let productosHTML = '';
    venta.products.forEach(producto => {
        productosHTML += `
            <div><b>Id Producto:</b> ${producto.productId}</div>
            <div><b>Cantidad:</b> ${producto.quantity}</div>
            <div><b>Precio:</b> $${producto.price.toFixed(2)}</div>
            ${producto.discount !== null ? `<div><b>Descuento:</b> ${producto.discount}%</div>` : ''}
            <br>
        `;
    });

    detallesDiv.innerHTML = `
        <div><b>Total:</b> $${venta.totalPay.toFixed(2)}</div>
        <div><b>Subtotal:</b> $${venta.subtotal.toFixed(2)}</div>
        <div><b>Impuesto por producto:</b> 21%</div>
        <br>
        <div><b>Productos:</b></div>
        <br>
        ${productosHTML}
    `;
}

// Evento para manejar la búsqueda cuando se hace clic en el botón
botonBuscar.addEventListener("click", handleBuscarClick);
