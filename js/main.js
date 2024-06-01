const urlProductos = "https://localhost:7036/api/Product";
let productos = [];
const spinner = document.getElementById('spinner-no-background');
const contenedorProductos = document.querySelector("#contenedor-productos");
const botonesCategorias = document.querySelectorAll(".boton-categoria");
const tituloPrincipal = document.querySelector(".titulo-principal");
let botonesAgregar;
const cantidadProductosComprados = document.querySelector(".cantidad-productos-comprados");
const buscador = document.querySelector("#buscador");
let productosFiltrados = []; // Lista para almacenar los productos filtrados
const overlay = document.getElementById('overlay');

/***SECCIÓN MENSAJES***/

function MostrarError(mensaje) {
    Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        customClass: {
            popup: 'custom-alert'
        }
    });
}

function MostrarMensajeProductoAgregado() {
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
}

/***SECCIÓN CARGA DE PRODUCTOS***/

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-ar', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

async function ObtenerProductos(endpoint) {
    try {
        let response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        MostrarError("No se pudieron cargar los productos. Intente recargar la página en unos minutos.");
        throw error;
    } finally {
        spinner.classList.add('hidden');
    }
}

// Cargar productos al inicio
spinner.classList.remove('hidden');
ObtenerProductos(urlProductos)
    .then((data) => {
        productos = data;
        CargarProductos(productos);
    })
    .catch(error => {
        // Mostrar la alerta se realiza dentro de ObtenerProductos
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
                            <strike>$${formatearNumero(producto.price)}</strike>
                            <span class="producto-precio-con-descuento">$${formatearNumero((producto.price * (1 - producto.discount / 100)).toFixed(2))}</span>
                        </span>
                        ` : `
                        <p class="producto-precio">$${formatearNumero(producto.price)}</p>
                        `}
                        ${producto.discount && producto.discount !== 0 ? `<p class="producto-descuento">- ${producto.discount}%</p>` : ''}
                    </div>
                    <div class="producto-detalles-botones">
                        <input type="number" min="1" max="99" value="1" class="cantidad-producto" id="cantidad-${producto.id}">
                        <button class="producto-agregar" data-id="${producto.id}">Agregar</button>
                    </div>
                </div>
            `;
        contenedorProductos.append(div);
    });
    // Añadir event listener a los enlaces de "Ver detalles"
    document.querySelectorAll('.producto-detalles-link').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const productId = this.dataset.id;
            MostrarDetallesProducto(productId);
        });
    });

    // Añadir event listeners a los inputs de cantidad
    document.querySelectorAll('.cantidad-producto').forEach(input => {
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
    });

    ActualizarBotonesAgregar();
}

function ActualizarBotonesAgregar() {
    const botonesAgregar = document.querySelectorAll(".producto-agregar");

    botonesAgregar.forEach(boton => {
        boton.addEventListener("click", function (e) {
            const productId = e.currentTarget.dataset.id;
            const cantidadInput = document.querySelector(`#cantidad-${productId}`);
            const cantidad = parseInt(cantidadInput.value);
            AgregarAlCarrito(productId, cantidad);
        });
    });
}

/***SECCIÓN BARRA DE BÚSQUEDA***/

// Buscador
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
                MostrarError("No se pudo realizar la búsqueda de los productos. Intente en unos minutos.");
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

// Vaciar el buscador al cambiar de página
botonesCategorias.forEach(boton => {
    boton.addEventListener("click", () => {
        buscador.value = "";
    });
});

/***SECCIÓN SELECCIÓN POR CATEGORÍAS***/

// Mapear categorias al ID correspondiente
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
                const productosBoton = await ObtenerProductos(endpoint);
                tituloPrincipal.innerText = boton.id;
                CargarProductos(productosBoton);
            } catch (error) {
                // El manejo de errores ya se realiza dentro de ObtenerProductos
            }
        } else if (boton.id === "todos") {
            tituloPrincipal.innerText = "Todos los productos";
            spinner.classList.remove('hidden');
            try {
                const productosTodos = await ObtenerProductos(urlProductos);
                productos = productosTodos;
                CargarProductos(productos);
            } catch (error) {
                // El manejo de errores ya se realiza dentro de ObtenerProductos
            }
        } else {
            console.error(`Categoría no encontrada: ${boton.id}`);
            spinner.classList.add('hidden');
        }
    });
});

/***MOSTRAR DETALLES DEL PRODUCTO***/

// Función para obtener los detalles del producto y mostrar el modal
function MostrarDetallesProducto(productId) {
    // Mostrar el spinner
    overlay.classList.remove('hidden');
    fetch(`${urlProductos}/${productId}`)
        .then(response => response.json())
        .then(producto => {
            // Ocultar el spinner
            overlay.classList.add('hidden');
            Swal.fire({
                title: producto.name,
                html: `
                    <div class="alinear-sweetalert">
                        <p><strong>Categoría:</strong> ${producto.category.name}</p><br>
                        <p><strong>Descripción:</strong> ${producto.description}</p>
                    </div>
                `,
                imageUrl: producto.imageUrl,
                imageWidth: 320,
                imageHeight: 320,
                imageAlt: producto.name,
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Continuar",
                customClass: {
                    popup: 'custom-alert'
                }
            });
        })
        .catch(error => {
            console.error('Error fetching product details:', error);
            MostrarError("No se pudieron cargar los detalles del producto.");
            // Ocultar el spinner
            overlay.classList.add('hidden');
        });
}

/***SECCIÓN CARGA DEL CARRITO ***/

let productosEnCarrito;

let productosEnCarritoLS = localStorage.getItem("productos-en-carrito");

if (productosEnCarritoLS) {
    productosEnCarrito = JSON.parse(productosEnCarritoLS);
    ActualizarCantidadProductosComprados();
} else {
    productosEnCarrito = [];
}

function AgregarAlCarrito(productId, cantidad) {
    const productoAgregado = productos.find(producto => producto.id === productId);

    if (productosEnCarrito.some(producto => producto.id === productId)) {
        const index = productosEnCarrito.findIndex(producto => producto.id === productId);
        const cantidadActual = productosEnCarrito[index].cantidad;
        const nuevaCantidad = cantidadActual + cantidad;

        if (nuevaCantidad > 99) {
            productosEnCarrito[index].cantidad = 99;
            MostrarError("No se puede agregar más de 99 unidades del mismo producto al carrito.");
        } else {
            productosEnCarrito[index].cantidad = nuevaCantidad;
            MostrarMensajeProductoAgregado();
        }
    } else {
        if (cantidad > 99) {
            productoAgregado.cantidad = 99;
            MostrarError("No se puede agregar más de 99 unidades del mismo producto al carrito.");
        } else {
            productoAgregado.cantidad = cantidad;
            MostrarMensajeProductoAgregado();
        }
        productosEnCarrito.push(productoAgregado);
    }

    ActualizarCantidadProductosComprados();

    localStorage.setItem("productos-en-carrito", JSON.stringify(productosEnCarrito));
}

function ActualizarCantidadProductosComprados() {
    let nuevaCantidadProductosComprados = productosEnCarrito.reduce((acc, producto) => acc + producto.cantidad, 0);
    cantidadProductosComprados.innerText = nuevaCantidadProductosComprados;
}