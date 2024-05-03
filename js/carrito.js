let productosEnCarrito = localStorage.getItem("productos-en-carrito");
productosEnCarrito = JSON.parse(productosEnCarrito);

console.log(productosEnCarrito);

const contenedorCarritoVacio = document.querySelector("#carrito-vacio");
const contenedorCarritoProductos = document.querySelector("#carrito-productos");
const contenedorCarritoAcciones = document.querySelector("#carrito-acciones");
const contenedorCarritoComprado = document.querySelector("#carrito-comprado");
let botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");
const botonVaciar = document.querySelector("#carrito-acciones-vaciar");
const contenedorTotal = document.querySelector("#total");
const botonComprar = document.querySelector("#carrito-acciones-comprar");

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
            div.innerHTML = `
                <img class="carrito-producto-imagen" src="${producto.imageUrl}" alt="${producto.name}">
                <div class="carrito-producto-titulo">
                    <small>Título</small>
                    <h3>${truncateString(producto.name, 5)}</h3>
                </div>
                <div class="carrito-producto-cantidad">
                    <small>Cantidad</small>
                    <p>${producto.cantidad}</p>
                </div>
                <div class="carrito-producto-precio">
                    <small>Precio</small>
                    <p>$${producto.price}</p>
                </div>
                <div class="carrito-descuento">
                ${producto.discount !== 0 ? `
                    <small>Descuento</small>
                    <p class="producto-descuento">- ${producto.discount}%</p>` : ''
                }
                </div>
                <div class="carrito-producto-subtotal">
                    <small>Subtotal</small>
                    <p>$${producto.price * producto.cantidad}</p>
                </div>
                <button class="carrito-producto-eliminar" id="${producto.id}"><i class="bi bi-trash-fill"></i></button>
        `;
            contenedorCarritoProductos.append(div);
        })
    } else {
        contenedorCarritoVacio.classList.remove("disabled");
        contenedorCarritoProductos.classList.add("disabled");
        contenedorCarritoAcciones.classList.add("disabled");
        contenedorCarritoComprado.classList.add("disabled");
    }

    ActualizarBotonesEliminar();
    ActualizarTotal();
}

CargarProductosCarrito();

function ActualizarBotonesEliminar() {
    botonesEliminar = document.querySelectorAll(".carrito-producto-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", EliminarDelCarrito);
    })
}

function EliminarDelCarrito(e) {
    const idBoton = e.currentTarget.id;
    const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
    productosEnCarrito.splice(index, 1);
    CargarProductosCarrito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

botonVaciar.addEventListener("click", VaciarCarrito);
botonComprar.addEventListener("click", ComprarCarrito);

function VaciarCarrito(e) {
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
    CargarProductosCarrito();
}

function ActualizarTotal() {
    let totalDescuento = productosEnCarrito.reduce((acc, producto) => acc + (((producto.price * (1 - (producto.discount / 100))) * producto.cantidad) * 1.21), 0);
    total.innerHTML = `$${totalDescuento.toFixed(2)}`;
    return totalDescuento.toFixed(2);
}

let totalCuenta = ActualizarTotal();

let listaProductos = [];
productosEnCarrito.forEach(producto => {
    listaProductos.push({
        productId: producto.id,
        quantity: producto.cantidad
    })
});

let nuevaVenta = {
    products : listaProductos,
    totalPayed: parseFloat(totalCuenta)
}

const opciones = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(nuevaVenta)
};

console.log(opciones.body);

const urlCompra = "https://localhost:7036/api/Sale";

function ComprarCarrito() {
    productosEnCarrito.length = 0;
    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));

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
        })
        .catch(error => {
            // Manejar errores de la solicitud
            console.error('Error:', error);
        });

    contenedorCarritoVacio.classList.add("disabled");
    contenedorCarritoProductos.classList.add("disabled");
    contenedorCarritoAcciones.classList.add("disabled");
    contenedorCarritoComprado.classList.remove("disabled");
}


function truncateString(str, numWords) {
    const words = str.split(' ');
    if (words.length > numWords) {
        return words.slice(0, numWords).join(' ') + '...';
    }
    return str;
}