let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);
const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#listado-informacion");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const urlCompra = "https://localhost:7036/Sale";

function MostrarMensajeProductoEliminado() {
    Toastify({
        text: "Producto eliminado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #A35FA3, #ececec)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: "0.75rem"
        },
        offset: {
            x: "1.5rem", // horizontal axis - can be a number or a string indicating unity. eg: '2em'
            y: "1.5rem" // vertical axis - can be a number or a string indicating unity. eg: '2em'
        },
        onClick: function () { } // Callback after click
    }).showToast();
}

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-ar', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}


function CargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        // Mostrar la clase carrito-resumen-compra
        document.querySelector(".carrito-resumen-compra").style.display = "block";

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");

            // Verifica si el producto tiene descuento
            let descuentoHTML = `<div class="carrito-producto-descuento" style="visibility: hidden;">Sin Descuento</div>`;
            if (producto.discount && producto.discount > 0) {
                descuentoHTML = `<div class="carrito-producto-descuento">Descuento: ${producto.discount}%</div>`;
            }

            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imageUrl}" alt="${producto.name}">
                <div class="carrito-producto-detalle">
                    <div class="nombre">${producto.name}</div>
                    <div class="primer-numero">
                        Cantidad: 
                        <input type="number" class="cantidad-producto" min="0" max="99" value="${producto.cantidad}" data-id="${producto.id}">
                    </div>
                    <div class="segundo-numero">Precio por unidad: $${formatearNumero(producto.price)}</div>
                    ${descuentoHTML}
                    <div class="tercer-numero">Subtotal: $${formatearNumero((producto.price * producto.cantidad).toFixed(2))}</div>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
            contenedorCarritoProductos.append(div);
        });

        // Event listeners para los cambios de cantidad
        const inputsCantidad = document.querySelectorAll('.cantidad-producto');
        inputsCantidad.forEach(input => {
            input.addEventListener('input', (event) => {
                if (event.target.value === '' || event.target.value < 0) {
                    event.target.value = 1;
                } else if (event.target.value > 99) {
                    event.target.value = 99;
                }
            });

            input.addEventListener('blur', (event) => {
                if (event.target.value > 99) {
                    event.target.value = 99;
                } else if (event.target.value < 0) {
                    event.target.value = 0;
                }
            });

            input.addEventListener('change', ActualizarCantidad);
        });
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        // Ocultar la clase carrito-resumen-compra
        document.querySelector(".carrito-resumen-compra").style.display = "none";
    }

    ActualizarBotonesEliminar();
    ActualizarTotales();
}


function ActualizarCantidad(e) {
    const idProducto = e.currentTarget.getAttribute('data-id');
    const cantidadNueva = parseInt(e.currentTarget.value);

    // Actualizar la cantidad del producto en el carrito
    const index = productosEnCarrito.findIndex(producto => producto.id === idProducto);
    if (index !== -1) {
        if (cantidadNueva === 0) {
            // Eliminar producto si la cantidad es 0
            productosEnCarrito.splice(index, 1);
            MostrarMensajeProductoEliminado();
        } else {
            productosEnCarrito[index].cantidad = cantidadNueva;
        }
    }

    // Recargar productos en el carrito
    CargarProductosCarrito();

    // Guardar los cambios en el almacenamiento local
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function ActualizarSubtotales() {
    const subtotales = document.querySelectorAll('.tercer-numero');
    productosEnCarrito.forEach((producto, index) => {
        const subtotal = subtotales[index];
        subtotal.textContent = `Subtotal: $${producto.price * producto.cantidad}`;
    });
}

CargarProductosCarrito();

function ActualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", EliminarDelCarrito);
    })
}

function ConfirmacionEliminacion(mensaje, confirmCallback) {
    Swal.fire({
        title: "¿Estás seguro?",
        text: mensaje,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        customClass: {
            popup: 'custom-alert'
        }
    }).then(confirmCallback);
}

function EliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    ConfirmacionEliminacion("¡Esta acción no puede ser revertida!", (result) => {
        if (result.isConfirmed) {
            const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
            if (index !== -1) {
                productosEnCarrito.splice(index, 1);
                localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
                CargarProductosCarrito();
                MostrarMensajeProductoEliminado();
            }
        }
    });
}

botonVaciar.addEventListener("click", VaciarCarrito);
botonComprar.addEventListener("click", ComprarCarrito);

function VaciarCarrito(e) {
    ConfirmacionEliminacion("¡Esta acción no puede ser revertida!", (result) => {
        if (result.isConfirmed) {
            Swal.fire({
                text: "Tu carrito ha sido vaciado.",
                icon: "success",
                customClass: {
                    popup: 'custom-alert'
                }
            });
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
            CargarProductosCarrito();
        }
    });
}

function ActualizarTotales() {
    let subtotal = 0;
    let totalDescuento = 0;
    let totalIVA = 0;

    productosEnCarrito.forEach(producto => {
        let precioOriginal = producto.price * producto.cantidad;
        let descuento = (producto.price * (producto.discount / 100)) * producto.cantidad;
        let precioConDescuento = precioOriginal - descuento;
        let iva = precioConDescuento * 0.21;

        subtotal += precioOriginal;
        totalDescuento += descuento;
        totalIVA += iva;
    });

    // Actualiza los elementos del DOM con los valores calculados
    document.getElementById('subtotal').innerHTML = `Subtotal:  $${formatearNumero(subtotal.toFixed(2))}`;
    //const numeroDescuentoTotalElement = document.getElementById('numeroDescuentoTotal');
    const descuentoTotalElement = document.getElementById('descuentoTotal');
    const numeroDescuentoTotalElement = document.getElementById('numeroDescuentoTotal');
    if (totalDescuento > 0) {
        numeroDescuentoTotalElement.textContent = `-$${formatearNumero(totalDescuento.toFixed(2))}`;
        descuentoTotalElement.classList.remove('hidden');
    } else {
        numeroDescuentoTotalElement.textContent = '';
        descuentoTotalElement.classList.add('hidden');
    }
    document.getElementById('iva').innerHTML = `Impuestos (IVA 21%):  $${formatearNumero(totalIVA.toFixed(2))}`;

    // Calcula el total con IVA incluido
    let totalConIVA = subtotal - totalDescuento + totalIVA;
    document.getElementById('total').innerHTML = `<b>Total:</b> $${formatearNumero(totalConIVA.toFixed(2))}`;
    return totalConIVA.toFixed(2);
}

// Event listener para los cambios de cantidad
document.querySelectorAll('.cantidad-producto').forEach(input => {
    input.addEventListener('change', function (event) {
        const productId = parseInt(event.target.dataset.id);
        const newQuantity = parseInt(event.target.value);

        // Actualizar la cantidad del producto correspondiente en productosEnCarrito
        const productoIndex = productosEnCarrito.findIndex(producto => producto.id === productId);
        if (productoIndex !== -1) {
            productosEnCarrito[productoIndex].cantidad = newQuantity;
        }
    });
});

// POST de compra
function ComprarCarrito() {
    // Mostrar el spinner loader
    document.getElementById('overlay').classList.remove('hidden');

    // Crear la lista de productos con las cantidades actualizadas
    let listaProductos = productosEnCarrito.map(producto => ({
        productId: producto.id,
        quantity: producto.cantidad
    }));

    let nuevaVenta = {
        products: listaProductos,
        totalPayed: parseFloat(ActualizarTotales())
    }

    const opciones = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaVenta)
    };

    fetch(urlCompra, opciones)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al enviar la solicitud');
            }
            return response.json();
        })
        .then(data => {
            // Limpiar el carrito y mostrar un mensaje de éxito
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

            Swal.fire({
                position: "center",
                icon: "success",
                title: "¡Su compra se realizó con éxito!",
                showConfirmButton: false,
                timer: 1500,
                customClass: {
                    popup: 'custom-alert'
                }
            });

            contenedorCarritoVacio.classList.add("disabled");
            contenedorCarritoProductos.classList.add("disabled");
            contenedorCarritoAcciones.classList.add("disabled");
            contenedorCarritoComprado.classList.remove("disabled");

            // Ocultar la clase carrito-resumen-compra
            document.querySelector(".carrito-resumen-compra").style.display = "none";
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo completar la venta. Vuelva a intentarlo más tarde.',
                icon: 'error',
                customClass: {
                    popup: 'custom-alert'
                }
            });
        })
        .finally(() => {
            // Ocultar el spinner loader
            document.getElementById('overlay').classList.add('hidden');
        });
}