const urlProductos = "https://localhost:7036/api/Product";
let productos = [];

fetch(urlProductos)
    .then(response => response.json())
    .then((data) => {
        productos = data;
        CargarProductos(productos);
        console.log(productos);
    })


const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector(".titulo-principal");
let botonesAgregar;
const numerito = document.querySelector(".numerito");

function CargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";
    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
        <img class="producto-imagen" src="${producto.imageUrl}" alt="${producto.name}">
        <div class="producto-detalles">
            <h3 class="producto-titulo">${producto.name}</h3>
            <div class="precio-y-descuento">
                <p class="producto-precio">$${producto.price}</p>
                ${
                    producto.discount !== 0 ? `<p class="producto-descuento">- ${producto.discount}%</p>` : ''
                }
            </div>
            <button class="producto-agregar" id="${producto.id}">Agregar</button>
        </div>
    `;

        contenedorProductos.append(div);
    })

    ActualizarBotonesAgregar();
}

botonesCategorias.forEach(boton => {
    boton.addEventListener("click", (e) => {

        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        e.currentTarget.classList.add("active");

        if (e.currentTarget.id != "todos") {
            const productoCategoria = productos.find(producto => producto.categoryName === e.currentTarget.id);
            tituloPrincipal.innerText = productoCategoria.categoryName;
            const productosBoton = productos.filter(producto => producto.categoryName === e.currentTarget.id);
            CargarProductos(productosBoton);
        } else {
            tituloPrincipal.innerText = "Todos los productos";
            CargarProductos(productos);
        }
    })
});

function ActualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", AgregarAlCarrito);
    })
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if(productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    ActualizarNumerito();
} else {
    productosEnCarrito = [];
}


function AgregarAlCarrito(e) {
    const idBoton = e.currentTarget.id;
    const productoAgregado = productos.find(producto => producto.id === idBoton);

    if (productosEnCarrito.some(producto => producto.id === idBoton)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === idBoton);
        productosEnCarrito[index].cantidad++;
    } else {
        productoAgregado.cantidad = 1;
        productosEnCarrito.push(productoAgregado);
    }

    ActualizarNumerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function ActualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}