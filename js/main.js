const urlProductos = "https://localhost:7036/api/Product";
let productos = [];

// Cargar todos los productos al inicio
fetch(urlProductos)
    .then(response => response.json())
    .then((data) => {
        productos = data;
        CargarProductos(productos);
        console.log(productos);
    });

console.log(productos);

const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector(".titulo-principal");
let botonesAgregar;
const numerito = document.querySelector(".numerito");
const buscador = document.querySelector("#buscador");

let productosFiltrados = []; // Lista para almacenar los productos filtrados

// Manejador del buscador
document.addEventListener("keyup", async e => {
    if (e.target.matches("#buscador")) {
        const valorBusqueda = e.target.value.toLowerCase();
        productosFiltrados = [];

        if (valorBusqueda.length > 0) {
            let endpoint = `${urlProductos}?name=${encodeURIComponent(valorBusqueda)}`;

            try {
                let response = await fetch(endpoint);
                if (response.ok) {
                    productosFiltrados = await response.json();

                    if (tituloPrincipal.innerText !== "Todos los productos") {
                        productosFiltrados = productosFiltrados.filter(producto =>
                            producto.categoryName === tituloPrincipal.innerText
                        );
                    }

                    CargarProductos(productosFiltrados);
                } else {
                    console.error("Error en la solicitud: " + response.statusText);
                }
            } catch (error) {
                console.error("Error de red: " + error.message);
            }
        } else {
            if (tituloPrincipal.innerText === "Todos los productos") {
                productosFiltrados = productos;
            } else {
                productosFiltrados = productos.filter(producto =>
                    producto.categoryName === tituloPrincipal.innerText
                );
            }

            CargarProductos(productosFiltrados);
        }
    }
});

// Limpiar el buscador al cambiar de categoría
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", () => {
        buscador.value = "";
    });
});

// Mapa de categorías a IDs
const categoriaMap = {
    "Electrodomésticos": 1,
    "Tecnología y Electrónica": 2,
    "Moda y Accesorios": 3,
    "Hogar y Decoración": 4,
    "Salud y Belleza": 5,
    "Deportes y Ocio": 6,
    "Juguetes y Juegos": 7,
    "Alimentos y Bebidas": 8,
    "Libros y Material Educativo": 9,
    "Jardinería y Bricolaje": 10
};

// Manejador de clic en los botones de categorías
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", async (e) => {
        const categoriaId = categoriaMap[boton.id];

        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        boton.classList.add("active");

        if (categoriaId) {
            let endpoint = `${urlProductos}?categories=${categoriaId}`;

            try {
                let response = await fetch(endpoint);
                if (response.ok) {
                    const productosBoton = await response.json();
                    tituloPrincipal.innerText = boton.id;
                    CargarProductos(productosBoton);
                } else {
                    console.error("Error en la solicitud: " + response.statusText);
                }
            } catch (error) {
                console.error("Error de red: " + error.message);
            }
        } else if (boton.id === "todos") {
            tituloPrincipal.innerText = "Todos los productos";
            CargarProductos(productos);
        } else {
            console.error(`Categoría no encontrada: ${boton.id}`);
        }
    });
});

function CargarProductos(productosElegidos) {
    contenedorProductos.innerHTML = "";
    productosElegidos.forEach(producto => {
        const div = document.createElement("div");
        div.classList.add("producto");
        div.innerHTML = `
            <img class="producto-imagen" src="${producto.imageUrl}" alt="${producto.name}">
            <div class="producto-detalles">
                <h3 class="producto-titulo">${producto.name}</h3>
                <a href="#" class="producto-detalles-link" data-id="${producto.id}">Ver detalles</a>
                <div class="precio-y-descuento">
                    ${producto.discount && producto.discount !== 0 ? `
                    <span class="precio-con-descuento">
                        <strike>$${producto.price}</strike>
                        <span class="producto-precio-con-descuento">$${(producto.price * (1 - producto.discount / 100)).toFixed(2)}</span>
                    </span>
                    ` : `
                    <p class="producto-precio">$${producto.price}</p>
                    `}
                    ${producto.discount && producto.discount !== 0 ? `<p class="producto-descuento">- ${producto.discount}%</p>` : ''}
                </div>
                <button class="producto-agregar" id="${producto.id}">Agregar</button>
            </div>
        `;

        contenedorProductos.append(div);
    });

    // Añadir event listener a los enlaces de "Ver detalles"
    document.querySelectorAll('.producto-detalles-link').forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const productId = this.dataset.id;
            fetchProductDetails(productId);
        });
    });

    ActualizarBotonesAgregar();
}

// Función para obtener los detalles del producto y mostrar el modal
function fetchProductDetails(productId) {
    fetch(`https://localhost:7036/api/Product/${productId}`)
        .then(response => response.json())
        .then(producto => {
            Swal.fire({
                title: producto.name,
                html: `
                    <p><strong>Categoría:</strong> ${producto.category.name}</p><br>
                    <p><strong>Descripción:</strong> ${producto.description}</p>
                `,
                imageUrl: producto.imageUrl,
                imageWidth: 320,
                imageHeight: 320,
                imageAlt: producto.name,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Ok",
                customClass: {
                    popup: 'custom-alert'
                }
            });
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudieron cargar los detalles del producto.',
                icon: 'error',
                customClass: {
                    popup: 'custom-alert'
                }
            });
        });
}


function ActualizarBotonesAgregar() {
    botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", AgregarAlCarrito);
    });
}

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    ActualizarNumerito();
} else {
    productosEnCarrito = [];
}

function AgregarAlCarrito(e) {
    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #800080, #A35FA3)",
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