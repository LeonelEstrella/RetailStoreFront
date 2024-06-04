const urlEndpoint = "https://localhost:7036/Sale";
const contenedorVentas = document.getElementById("ventas-lista");
const inputFechaInicio = document.getElementById("fecha-inicio");
const inputFechaFin = document.getElementById("fecha-fin");
const botonBuscar = document.getElementById("boton-buscar");
const spinner = document.getElementById('spinner-no-background');
const mensajeError = document.getElementById('mensajeError');

// Función para mostrar el spinner
function MostrarSpinner() {
    spinner.classList.remove('hidden');
    spinner.classList.add('visible');
}

// Función para ocultar el spinner
function OcultarSpinner() {
    spinner.classList.remove('visible');
    spinner.classList.add('hidden');
}

function MostrarMensaje(titulo, mensaje, icono) {
    Swal.fire({
        title: titulo,
        text: mensaje,
        icon: icono,
        customClass: {
            popup: 'custom-alert'
        }
    });
}

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-ar', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

function MostrarMensajeError(mensaje) {
    const mensajeError = document.getElementById('mensajeError');
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
}

document.getElementById('buscador').addEventListener('input', async () => {
    const saleId = document.getElementById('buscador').value;

    if (saleId) {
        mensajeError.style.display = 'none';  // Ocultar mensaje de error durante la búsqueda
        await BuscarVentaPorId(saleId);
    } else {
        contenedorVentas.innerHTML = ""; // Limpiar el contenido si no hay ID
        mensajeError.style.display = 'none';  // Ocultar mensaje de error si no hay ID
    }
});

async function BuscarVentaPorId(saleId) {
    contenedorVentas.innerHTML = ""; // Limpiar el contenido previo antes de buscar una nueva venta
    MostrarSpinner();
    try {
        const url = `${urlEndpoint}/${saleId}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                throw new Error("No se pudo cargar la información de la venta. Intente nuevamente en unos minutos.");
            }
        }

        const venta = await response.json();
        if (!venta || Object.keys(venta).length === 0) {
            MostrarMensajeError("No existe ninguna venta con ese ID");
        } else {
            MostrarVentas([venta]);
        }
    } catch (error) {
        console.error("Error:", error);
        if (error.message.includes('status: 404')) {
            MostrarMensajeError("No existe ninguna venta con el ID ingresado.");
        } else {
            MostrarMensaje("Error", "No se pudo cargar la información de la venta. Intente nuevamente en unos minutos.", "error");
        }
    } finally {
        OcultarSpinner();
    }
}

// Cargar las ventas
async function CargarVentasDesdeFechas(fechaInicio, fechaFin) {
    MostrarSpinner();
    try {
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

        const response = await fetch(urlConFechas);
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                throw new Error("No se pudo cargar la información de las ventas. Intente nuevamente en unos minutos.");
            }
        }

        const ventas = await response.json();
        if (ventas.length === 0) {
            MostrarMensaje("Sin ventas", "No se encontraron ventas en las fechas especificadas.", "info");
        } else {
            MostrarVentas(ventas);
        }
    } catch (error) {
        console.error("Error:", error);
        if (error.message.includes('status: 400')) {
            MostrarMensaje("Error", "Los datos propiciados no son correctos. La fecha de inicio no puede ser mayor a la fecha de fin.", "error");
        } else {
            MostrarMensaje("Error", "No se pudo cargar la información de las ventas. Intente nuevamente en unos minutos.", "error");
        }
    } finally {
        OcultarSpinner();
    }
}

function ManejadorBuscarClick() {
    const fechaInicio = inputFechaInicio.value;
    const fechaFin = inputFechaFin.value;

    // Cargar las ventas según los datos proporcionados
    CargarVentasDesdeFechas(fechaInicio || null, fechaFin || null);
}

// Mostrar las ventas
function MostrarVentas(ventas) {
    contenedorVentas.innerHTML = ""; // Limpiar el contenido previo
    mensajeError.style.display = 'none';  // Ocultar mensaje de error si se encuentra una venta

    ventas.forEach(venta => {
        const div = CrearVentaDiv(venta);
        contenedorVentas.append(div);

        // Seleccionar el modal y los botones específicos de esta venta
        const btnAbrirModal = div.querySelector(`#boton-abrir-modal-${venta.id}`);
        const btnCerrarModal = div.querySelector(`#boton-cerrar-modal-${venta.id}`);
        const modal = div.querySelector(`#modal-${venta.id}`);
        const detallesDiv = modal.querySelector(".venta-detalles");
        const overlay = document.getElementById('overlay');

        btnAbrirModal.addEventListener("click", async () => {
            // Mostrar el spinner
            overlay.classList.remove('hidden');

            const detallesCargados = await CargarDetallesVenta(venta.id, detallesDiv);

            // Ocultar el spinner
            overlay.classList.add('hidden');
            if (detallesCargados) {
                modal.showModal();
            }
        });

        btnCerrarModal.addEventListener("click", () => {
            modal.close();
        });

        // Evento para cerrar el modal al hacer click fuera
        modal.addEventListener("click", (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    });
}

function CrearVentaDiv(venta) {
    const fechaVenta = new Date(venta.date);
    const fechaFormateada = `${fechaVenta.getDate()}/${fechaVenta.getMonth() + 1}/${fechaVenta.getFullYear()}`;

    const div = document.createElement("div");
    div.classList.add("venta-producto");
    div.dataset.id = venta.id;

    // Generar IDs para los botones y modales
    const modalId = `modal-${venta.id}`;
    const btnAbrirModalId = `boton-abrir-modal-${venta.id}`;
    const btnCerrarModalId = `boton-cerrar-modal-${venta.id}`;

    div.innerHTML = `
        <i class="bi bi-receipt"></i>
        <div class="venta-producto-detalle">
            <div class="nombre">ID de venta: ${venta.id}</div>
            <div class="primer-numero">Total: $${formatearNumero(venta.totalPay.toFixed(2))}</div>
            <div class="segundo-numero">Cantidad de Productos: ${venta.totalQuantity}</div>
            <div class="tercer-numero">Fecha: ${fechaFormateada}</div>
            <button class="boton-ver-detalle-venta" id="${btnAbrirModalId}">Ver detalles</button>
            <dialog id="${modalId}">
                <h2 class="titulo-principal">Detalles de la venta</h2>
                <div class="venta-detalles"></div> <!-- Contenedor para los detalles de la venta -->
                <button class="boton-cerrar-modal" id="${btnCerrarModalId}">Cerrar ventana</button>
            </dialog>
        </div>
    `;

    return div;
}

// Mostrar detalles de una venta específica
async function CargarDetallesVenta(saleId, detallesDiv) {
    try {
        const response = await fetch(`${urlEndpoint}/${saleId}`);
        if (!response.ok) {
            throw new Error("Error al cargar los detalles de la venta");
        }
        const venta = await response.json();
        MostrarDetallesVenta(venta, detallesDiv);
        return true;
    } catch (error) {
        console.error("Error:", error);
        MostrarMensaje("Error", "No se pudo cargar el detalle de la venta. Intente nuevamente en unos minutos.", "error");
        return false;
    }
}

// Cargar detalles de la venta dentro del div
function MostrarDetallesVenta(venta, detallesDiv) {
    let productosHTML = '';
    venta.products.forEach(producto => {
        productosHTML += `
            <div><b>Id Producto:</b> ${producto.productId}</div>
            <div><b>Cantidad:</b> ${producto.quantity}</div>
            <div><b>Precio:</b> $${formatearNumero(producto.price.toFixed(2))}</div>
            ${producto.discount !== null ? `<div><b>Descuento:</b> ${producto.discount}%</div>` : ''}
            <br>
        `;
    });

    detallesDiv.innerHTML = `
        <div><b>Venta ID:</b> ${venta.id}</div>
        <div><b>Total:</b> $${formatearNumero(venta.totalPay.toFixed(2))}</div>
        <div><b>Subtotal:</b> $${formatearNumero(venta.subtotal.toFixed(2))}</div>
        <div><b>Impuesto por producto:</b> 21%</div>
        <br>
        <div><b>Productos:</b></div>
        <br>
        ${productosHTML}
    `;
}

// Evento para manejar la búsqueda cuando se hace click en el botón
botonBuscar.addEventListener("click", ManejadorBuscarClick);