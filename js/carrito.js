let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

console.log(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#listado-informacion");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");
const urlCompra = "https://localhost:7036/Sale";

function CargarProductosCarrito() {
    if (productosEnCarrito && productosEnCarrito.length > 0) {
        contenedorCarritoVacio.classList.add("disabled");
        contenedorCarritoProductos.classList.remove("disabled");
        contenedorCarritoAcciones.classList.remove("disabled");
        contenedorCarritoComprado.classList.add("disabled");

        contenedorCarritoProductos.innerHTML = "";

        productosEnCarrito.forEach(producto => {
            const div = document.createElement("div");
            div.classList.add("carrito-producto");

            // Verificar si el producto tiene descuento
            let descuentoHTML = `<div class="carrito-producto-descuento" style="visibility: hidden;">Sin Descuento</div>`;
            if (producto.discount && producto.discount > 0) {
                descuentoHTML = `<div class="carrito-producto-descuento">Descuento x ud: ${producto.discount}%</div>`;
            }

            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imageUrl}" alt="${producto.name}">
                <div class="carrito-producto-detalle">
                    <div class="nombre">${producto.name}</div>
                    <div class="primer-numero">
                        Cantidad: 
                        <input type="number" class="cantidad-producto" min="0" max="99" value="${producto.cantidad}" data-id="${producto.id}">
                    </div>
                    <div class="segundo-numero">Precio x ud: $${producto.price}</div>
                    ${descuentoHTML}
                    <div class="tercer-numero">Subtotal: $${(producto.price * producto.cantidad).toFixed(2)}</div>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
            `;
            contenedorCarritoProductos.append(div);
        });

        // Agregar event listeners para los cambios en la cantidad
        const inputsCantidad = document.querySelectorAll('.cantidad-producto');
        inputsCantidad.forEach(input => {
            input.addEventListener('input', (event) => {
                if (event.target.value > 99) {
                    event.target.value = 99;
                }
            });

            input.addEventListener('blur', (event) => {
                if (event.target.value > 99) {
                    event.target.value = 99;
                }
            });

            input.addEventListener('change', ActualizarCantidad);
        });
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }

    ActualizarBotonesEliminar();
    ActualizarTotal();
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

function EliminarDelCarrito(e) {

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

    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    productosEnCarrito.splice(index, 1);
    CargarProductosCarrito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

botonVaciar.addEventListener("click", VaciarCarrito);
botonComprar.addEventListener("click", ComprarCarrito);

function VaciarCarrito(e) {

    Swal.fire({
        title: "¿Estás seguro?",
        text: "¡Esta acción no puede ser revertida!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        reverseButtons: true
    }).then((result) => {
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

function ActualizarTotal() {
    let totalDescuento = productosEnCarrito.reduce((acc, producto) => acc + (((producto.price * (1 - (producto.discount / 100))) * producto.cantidad) * 1.21), 0);
    total.innerHTML = `$${totalDescuento.toFixed(2)}`;
    return totalDescuento.toFixed(2);
}

// Escuchar el evento de cambio en los inputs de cantidad
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

// Método para enviar la solicitud de compra
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
        totalPayed: parseFloat(ActualizarTotal())
    }

    const opciones = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaVenta)
    };

    console.log(opciones.body);

    fetch(urlCompra, opciones)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al enviar la solicitud');
            }
            return response.json(); // Convertir la respuesta a JSON
        })
        .then(data => {
            // Hacer algo con los datos de la respuesta, si es necesario
            console.log(data);
            // Limpiar el carrito y mostrar un mensaje de éxito
            productosEnCarrito.length = 0;
            localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Su compra se realizó con éxito!",
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
        })
        .catch(error => {
            // Manejar errores de la solicitud
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