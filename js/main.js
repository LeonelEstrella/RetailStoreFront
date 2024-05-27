const urlProductos = "https://localhost:7036/api/Product";
let productos = [];
const spinner = document.getElementById('spinner-no-background');

async function cargarProductos(endpoint) {
    try {
        let response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los productos. Intente recargar la página en unos minutos.',
            icon: 'error',
            customClass: {
                popup: 'custom-alert'
            }
        });
        throw error;
    } finally {
        spinner.classList.add('hidden');
    }
}

// Cargar productos al inicio
spinner.classList.remove('hidden');
cargarProductos(urlProductos)
    .then((data) => {
        productos = data;
        CargarProductos(productos);
    })
    .catch(error => {
        // El manejo de errores ya se realiza dentro de cargarProductos
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
                Swal.fire({
                    title: 'Error',
                    text: 'No se pudo realizar la búsqueda de los productos. Intente en unos minutos.',
                    icon: 'error',
                    customClass: {
                        popup: 'custom-alert'
                    }
                });
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
        spinner.classList.remove('hidden');
        botonesCategorias.forEach(boton => boton.classList.remove("active"));
        boton.classList.add("active");

        if (categoriaId) {
            let endpoint = `${urlProductos}?categories=${categoriaId}`;
            try {
                const productosBoton = await cargarProductos(endpoint);
                tituloPrincipal.innerText = boton.id;
                CargarProductos(productosBoton);
            } catch (error) {
                // El manejo de errores ya se realiza dentro de cargarProductos
            }
        } else if (boton.id === "todos") {
            tituloPrincipal.innerText = "Todos los productos";
            spinner.classList.remove('hidden');
            try {
                const productosTodos = await cargarProductos(urlProductos);
                productos = productosTodos;
                CargarProductos(productos);
            } catch (error) {
                // El manejo de errores ya se realiza dentro de cargarProductos
            }
        } else {
            console.error(`Categoría no encontrada: ${boton.id}`);
            spinner.classList.add('hidden');
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
                <div class="ver-detalles-contenedor">
                    <a href="#" class="producto-detalles-link" data-id="${producto.id}">
                        <span>Ver detalles</span>
                    </a>
                </div>
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
                <div class="producto-detalles-botones">
                    <input type="number" min="1" value="1" class="cantidad-producto" id="cantidad-${producto.id}">
                    <button class="producto-agregar" data-id="${producto.id}">Agregar</button>
                </div>
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
                    <div class="align-sweetalert-left">
                        <p><strong>Categoría:</strong> ${producto.category.name}</p><br>
                        <p><strong>Descripción:</strong> ${producto.description}</p>
                    </div>
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
    const botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", function(e) {
            const productId = e.currentTarget.dataset.id;
            const cantidadInput = document.querySelector(`#cantidad-${productId}`);
            const cantidad = parseInt(cantidadInput.value);
            AgregarAlCarrito(productId, cantidad);
        });
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

function AgregarAlCarrito(productId, cantidad) {
    Toastify({
        text: "Producto agregado",
        duration: 3000,
        close: true,
        gravity: "top", 
        position: "right", 
        stopOnFocus: true, 
        style: {
            background: "linear-gradient(to right, #800080, #A35FA3)",
            borderRadius: "2rem",
            textTransform: "uppercase",
            fontSize: "0.75rem"
        },
        offset: {
            x: "1.5rem", 
            y: "1.5rem" 
        },
        onClick: function () { } 
    }).showToast();

    const productoAgregado = productos.find(producto => producto.id === productId);

    if (productosEnCarrito.some(producto => producto.id === productId)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === productId);
        productosEnCarrito[index].cantidad += cantidad;
    } else {
        productoAgregado.cantidad = cantidad;
        productosEnCarrito.push(productoAgregado);
    }

    ActualizarNumerito();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}


function ActualizarNumerito() {
    let nuevoNumerito = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    numerito.innerText = nuevoNumerito;
}