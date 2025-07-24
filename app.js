//Productos desde Supabase 
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

    const SUPABASE_URL = 'https://twznikjjvtoedfaxbuvf.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE';

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    async function cargarProductos() {
      const { data: productos, error } = await supabase
        .from('productos')
        .select('*');

      if (error) {
        console.error("Error al cargar productos:", error);
        return;
      }

      const contenedor = document.getElementById("contenedor-productos");
      contenedor.innerHTML = "";

      productos.forEach((producto) => {
        const div = document.createElement("div");
        div.classList.add("producto-card");
       div.innerHTML = `
  <img class="producto-img" src="${producto.imagen_url}" alt="${producto.nombre}" />
  <h3>${producto.nombre}</h3>
  <p>${producto.descripcion}</p>
  <p class="precio">S/ ${producto.precio.toFixed(2)}</p>
  <p class="stock">${producto.stock > 0 ? `Stock: ${producto.stock}` : '<span style="color:red">Agotado</span>'}</p>
  ${producto.stock > 0 ? `<button onclick='agregarAlCarrito(${JSON.stringify(producto)})'>Agregar al carrito</button>` : ''}
`;

        contenedor.appendChild(div);
      });
    }

    cargarProductos();
  </script>
  <script>
  let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

  function agregarAlCarrito(producto) {
    const index = carrito.findIndex(p => p.id === producto.id);
    if (index > -1) {
      carrito[index].cantidad += 1;
    } else {
      carrito.push({ ...producto, cantidad: 1 });
    }
    actualizarCarrito();
  }

  function mostrarCarrito() {
    document.getElementById('modal-carrito').style.display = 'block';
    renderizarCarrito();
  }

  function cerrarCarrito() {
    document.getElementById('modal-carrito').style.display = 'none';
  }

  function eliminarDelCarrito(id) {
    carrito = carrito.filter(p => p.id !== id);
    actualizarCarrito();
  }

  function actualizarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    document.getElementById('contador-carrito').innerText = carrito.reduce((acc, p) => acc + p.cantidad, 0);
    renderizarCarrito();
  }

  function renderizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const total = document.getElementById('total-carrito');
    lista.innerHTML = '';
    if (carrito.length === 0) {
    lista.innerHTML = "<p>Tu carrito está vacío.</p>";
    total.innerText = "Total: S/ 0.00";
    return;
  }

    let totalPrecio = 0;
    carrito.forEach(p => {
      totalPrecio += p.precio * p.cantidad;
      const div = document.createElement('div');
      div.classList.add('item-carrito');
      div.innerHTML = `
        <p><strong>${p.nombre}</strong> (x${p.cantidad}) - S/ ${(p.precio * p.cantidad).toFixed(2)}</p>
        <button onclick="eliminarDelCarrito(${p.id})">Eliminar</button>
      `;
      lista.appendChild(div);
    });
 // Botón para vaciar carrito
  const btnVaciar = document.createElement("button");
  btnVaciar.innerText = "Vaciar carrito";
  btnVaciar.onclick = () => {
    carrito = [];
    actualizarCarrito();
  };
  lista.appendChild(btnVaciar);
    total.innerText = `Total: S/ ${totalPrecio.toFixed(2)}`;
  }


  // Al cargar la página
  document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();
});

</script>
<!-- Supabase JS -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  
  async function enviarPedidoASupabase(pedido) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        total: pedido.total,
        estado: 'pendiente',
        detalles: pedido.productos // Debes crear este campo tipo JSONB en Supabase
      }]);

    if (error) {
      console.error('❌ Error al guardar el pedido en Supabase:', error);
      alert("Hubo un error al guardar tu pedido. Intenta nuevamente.");
    } else {
      console.log('✅ Pedido guardado en Supabase:', data);
      abrirWhatsApp(pedido); // Abrimos WhatsApp después de guardar
    }
  }

  function abrirWhatsApp(pedido) {
    let mensaje = `🛒 *Nuevo pedido Crackio Store*:%0A`;

    pedido.productos.forEach(p => {
      mensaje += `- ${p.nombre} x${p.cantidad} (S/ ${p.precio_unitario})%0A`;
    });

    mensaje += `%0A💵 *Total:* S/ ${pedido.total.toFixed(2)}`;
    const numero = "51999207025"; // Cambia por tu número con código país
    const url = `https://wa.me/${numero}?text=${mensaje}`;
    window.open(url, "_blank");
  }

</script>
<footer class="footer">
  <p>&copy; 2025 Crackio Store. Todos los derechos reservados.</p>
  <a href="politica.html">Política de Privacidad</a> | 
  <a href="condiciones.html">Condiciones de Compra</a>
</footer>
<script type="module">
  // Configuración de Supabase
  const supabaseUrl = 'https://twznikjjvtoedfaxbuvf.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  // Función para obtener productos del carrito (ajusta según cómo los almacenes)
  function obtenerCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    return carrito;
  }

  document.getElementById('pedidoForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombreCliente').value;
    const telefono = document.getElementById('telefonoCliente').value;
    const direccion = document.getElementById('direccionCliente').value;
    const metodoPago = document.getElementById('metodoPago').value;
    const notas = document.getElementById('notasCliente').value;
    const productos = obtenerCarrito();

    const total = productos.reduce((acc, prod) => acc + (prod.precio * prod.cantidad), 0);

    const { data, error } = await supabase
      .from('pedidos')
      .insert([{
        nombre_cliente: nombre,
        telefono,
        direccion,
        metodo_pago: metodoPago,
        notas,
        productos,
        total,
        estado: 'pendiente'
      }]);

    if (error) {
      alert('Error al registrar pedido: ' + error.message);
      console.error(error);
    } else {
  alert('¡Pedido enviado con éxito!');
  localStorage.removeItem('carrito');

  // Abre WhatsApp después de guardar
  enviarPedidoWhatsApp();

  // Espera un poco antes de recargar
  setTimeout(() => {
    location.reload();
  }, 3000);
}
  });
</script>

<!-- Incluye Supabase (si no lo has hecho ya) -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script>
      function validarFormulario() {
  const nombre = document.getElementById("nombreCliente").value.trim();
  const telefono = document.getElementById("telefonoCliente").value.trim();
  const direccion = document.getElementById("direccionCliente").value.trim();

  if (!nombre || !telefono || !direccion) {
    alert("Por favor, completa todos los campos obligatorios.");
    return false;
  }

  if (!/^[9]\d{8}$/.test(telefono)) {
    alert("Ingresa un número de teléfono válido de 9 dígitos (Ej: 999123456).");
    return false;
  }

  return true;
}
function enviarPedidoWhatsApp() {
  const nombre = document.getElementById("nombreCliente").value;
  const direccion = document.getElementById("direccionCliente").value;
  const telefono = document.getElementById("telefonoCliente").value;
  const metodoPago = document.getElementById("metodoPago").value;
  const notas = document.getElementById("notasCliente").value;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  let mensaje = "*🛒 Nuevo pedido desde Crackio Store*%0A";
  mensaje += `👤 *Nombre:* ${nombre}%0A`;
  mensaje += `📞 *Teléfono:* ${telefono}%0A`;
  mensaje += `📍 *Dirección:* ${direccion}%0A`;
  mensaje += `💳 *Método de pago:* ${metodoPago}%0A`;
  if (notas) mensaje += `📝 *Notas:* ${notas}%0A`;

  mensaje += `%0A*Productos:*%0A`;
  carrito.forEach((item, index) => {
    mensaje += `${index + 1}. ${item.nombre} x${item.cantidad} - S/ ${item.precio}%0A`;
  });

  const total = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  mensaje += `%0A💵 *Total:* S/ ${total.toFixed(2)}`;

  const numeroWhatsApp = "51999207025";
  const url = `https://wa.me/${numeroWhatsApp}?text=${mensaje}`;
  window.open(url, "_blank");
}

// Conecta el botón cuando se cargue el DOM
document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("btn-enviar-pedido");
  if (boton) {
    boton.addEventListener("click", () => {
  if (validarFormulario()) {
    enviarPedidoWhatsApp();
  }
});
  }
});
</script>
<script>
  function mostrarFormularioPedido() {
    document.getElementById("formulario-pedido").style.display = "block";
  }
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>
<script>
  // REGISTRO
  const supabase = createClient('https://twznikjjvtoedfaxbuvf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE');
 async function registrar() {
  const email = document.getElementById("registroEmail").value;
  const password = document.getElementById("registroPassword").value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert("Error al registrar: " + error.message);
  } else {
    alert("Registro exitoso. Ya puedes iniciar sesión.");
    document.getElementById("formRegistro").reset();
    mostrarLogin(); // Muestra el formulario de login
  }
}



  // INICIO DE SESIÓN
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
    } else {
      alert("Inicio de sesión exitoso.");
    }
  }
async function verificarSesion() {
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    console.log("🟢 Usuario logueado:", user.email);
    // Aquí puedes mostrar el nombre o habilitar el envío de pedido
  } else {
    console.log("🔴 No hay usuario logueado");
    // Podrías deshabilitar el botón de enviar o mostrar formulario
  }
}
  // OBTENER USUARIO ACTUAL
  async function obtenerUsuarioActual() {
    const { data: { user } } = await supabase.auth.getUser();
    console.log("Usuario actual:", user);
  }

  // CERRAR SESIÓN
  async function logout() {
    await supabase.auth.signOut();
    alert("Sesión cerrada");
  }
  async function registroDesdeFormulario() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    alert("❌ Error al registrarse: " + error.message);
  } else {
    alert("✅ Registrado correctamente. Verifica tu correo.");
  }
}
  window.addEventListener("DOMContentLoaded", () => {
    verificarSesion(); // al cargar la página
  });

</script>
<!-- FORMULARIO DE REGISTRO -->
<div id="registro">
  <h3>Crear cuenta</h3>
  <input type="email" id="registroEmail" placeholder="Correo electrónico" required><br><br>
  <input type="password" id="registroPassword" placeholder="Contraseña" required><br><br>
  
</div>
<script>
  
  async function registrar() {
    const email = document.getElementById("registroEmail").value;
    const password = document.getElementById("registroPassword").value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Error al registrar:", error.message);
      alert("Error: " + error.message);
    } else {
      alert("¡Registro exitoso!");
      console.log("Usuario creado:", data);
    }
  }
</script>

<script>
  
  async function registrarUsuario() {
    const email = document.getElementById('registroEmail').value;
    const password = document.getElementById('registroPassword').value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      alert("Error al registrar: " + error.message);
    } else {
      alert("¡Registro exitoso!");
    }
  }

  async function loginUsuario() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
    } else {
      alert("¡Inicio de sesión exitoso!");
    }
  }
</script>
<!-- FORMULARIO DE AUTENTICACIÓN -->
<div id="auth-container">
  <div id="login-form" style="display: none;">
    <h3>Iniciar Sesión</h3>
    <input type="email" id="loginEmail" placeholder="Email" required><br><br>
    <input type="password" id="loginPassword" placeholder="Contraseña" required><br><br>
    <button onclick="login()">Iniciar Sesión</button>
  </div>

  <div id="registro-form" style="display: none;">
    <h3>Crear Cuenta</h3>
    <input type="email" id="registroEmail" placeholder="Email" required><br><br>
    <input type="password" id="registroPassword" placeholder="Contraseña" required><br><br>
    <button onclick="registrar()">Crear Cuenta</button>
  </div>

  <div id="logout-container" style="display: none;">
    <p id="usuario-logueado"></p>
    <button onclick="logout()">Cerrar Sesión</button>
  </div>

  <!-- Botones para abrir los formularios -->
  <button onclick="mostrarLogin()">Iniciar Sesión</button>
  <button onclick="mostrarRegistro()">Crear Cuenta</button>
</div>
<script>
  const supabase = supabase.createClient('https://twznikjjvtoedfaxbuvf.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3em5pa2pqdnRvZWRmYXhidXZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyOTI1NDAsImV4cCI6MjA2ODg2ODU0MH0.aOQ10hq-syYqrenvFxveBQj6wKqdDtsDKfykSm42MFE');

  function mostrarLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('registro-form').style.display = 'none';
  }

  function mostrarRegistro() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('registro-form').style.display = 'block';
  }

  async function registrar() {
    const email = document.getElementById('registroEmail').value;
    const password = document.getElementById('registroPassword').value;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: '', // vacío desactiva confirmación por email
      }
    });

    if (error) {
      alert("Error al registrar: " + error.message);
    } else {
      alert("Cuenta creada con éxito.");
      mostrarLogin();
    }
  }

  async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
    } else {
      alert("Sesión iniciada correctamente");
      document.getElementById('login-form').style.display = 'none';
      document.getElementById('logout-container').style.display = 'block';
      document.getElementById('usuario-logueado').textContent = `Bienvenido, ${email}`;
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert("Error al cerrar sesión: " + error.message);
    } else {
      alert("Sesión cerrada");
      document.getElementById('logout-container').style.display = 'none';
    }
  }

  // Verificar si hay usuario logueado al cargar
  window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      document.getElementById("btnCrearCuenta").addEventListener("click", registrar);
      document.getElementById('logout-container').style.display = 'block';
      document.getElementById('usuario-logueado').textContent = `Bienvenido, ${session.user.email}`;
      
    }
  });
</script>
