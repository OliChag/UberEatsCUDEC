let mapa = null;
let qrcode = null;

document.addEventListener("DOMContentLoaded", () => {
  const menus = document.querySelectorAll(".side-menu");
  M.Sidenav.init(menus, { edge: "right" });

  cargarPlatillos();
  configurarQR();
  configurarPedido();
  configurarDireccion();
});

function cargarPlatillos() {
  const listaPlatillo = document.getElementById("listaPlatillo");

  db.collection("platillos").onSnapshot((datos) => {
    // Conserva esta opción para que no se seleccione Pozole automáticamente.
    listaPlatillo.innerHTML = `
      <option value="" disabled selected>Seleccione un platillo</option>
    `;

    datos.forEach((registro) => {
      const platillo = registro.data();

      const opcion = document.createElement("option");
      opcion.value = registro.id;
      opcion.dataset.nombre = platillo.nombre;
      opcion.textContent = `${platillo.nombre} - $${platillo.precio}`;

      listaPlatillo.appendChild(opcion);
    });

    actualizarSelect();
  });
}

function actualizarSelect() {
  const listaPlatillo = document.getElementById("listaPlatillo");
  const instancia = M.FormSelect.getInstance(listaPlatillo);

  if (instancia) {
    instancia.destroy();
  }

  M.FormSelect.init(listaPlatillo);
}

function configurarQR() {
  const listaPlatillo = document.getElementById("listaPlatillo");
  const contenedorQR = document.getElementById("qrcode");
  const nombreQR = document.getElementById("nombreQR");

  qrcode = new QRCode(contenedorQR, {
    width: 180,
    height: 180,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });

  listaPlatillo.addEventListener("change", () => {
    const opcion = listaPlatillo.options[listaPlatillo.selectedIndex];
    const nombrePlatillo = opcion.dataset.nombre;

    qrcode.clear();
    nombreQR.textContent = "";

    if (!nombrePlatillo) return;

    qrcode.makeCode(nombrePlatillo);
    nombreQR.textContent = `QR del platillo: ${nombrePlatillo}`;
  });
}

function configurarPedido() {
  const formularioPedido = document.getElementById("formPedido");
  const listaPlatillo = document.getElementById("listaPlatillo");
  const nombreQR = document.getElementById("nombreQR");

  formularioPedido.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!listaPlatillo.value) {
      alert("Selecciona un platillo.");
      return;
    }

    const opcion = listaPlatillo.options[listaPlatillo.selectedIndex];

    const pedidoNuevo = {
      platillo: listaPlatillo.value,
      nombrePlatillo: opcion.dataset.nombre,
      nombre: formularioPedido.nombre.value,
      direccion: formularioPedido.direccion.value
    };

    db.collection("pedidos")
      .add(pedidoNuevo)
      .then(() => {
        alert("Pedido realizado exitosamente");

        formularioPedido.reset();
        qrcode.clear();
        nombreQR.textContent = "";

        actualizarSelect();
      })
      .catch((error) => {
        console.log(error);
        alert("Error al realizar el pedido");
      });
  });

  document.getElementById("btnCancelar").addEventListener("click", () => {
    setTimeout(() => {
      qrcode.clear();
      nombreQR.textContent = "";
      actualizarSelect();
    }, 0);
  });
}

function configurarDireccion() {
  document.getElementById("btnDireccion").addEventListener("click", (e) => {
    e.preventDefault();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(exito, errorUbicacion);
    } else {
      alert("La geolocalización no es compatible con este navegador.");
    }
  });
}

function exito(posicion) {
  const latitud = posicion.coords.latitude;
  const longitud = posicion.coords.longitude;

  fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}`
  )
    .then((respuesta) => respuesta.json())
    .then((data) => {
      const ciudad = data.address.city || data.address.town || "";
      const pais = data.address.country || "";

      document.getElementById("direccion").value =
        `Ciudad: ${ciudad}, País: ${pais}`;

      if (mapa) {
        mapa.remove();
      }

      mapa = L.map("map").setView([latitud, longitud], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }).addTo(mapa);

      L.marker([latitud, longitud]).addTo(mapa);
    })
    .catch((error) => console.error(error));
}

function errorUbicacion(error) {
  alert("Error al obtener la ubicación: " + error.message);
  console.log(error);
}