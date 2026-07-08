let contenidoPlatillo = "";
db.collection("platillos").onSnapshot((datos) => {
     datos.docChanges().forEach((registro) => {
        if (registro.type === "added") {
            agregarPlatillo(registro.doc.data(), registro.doc.id);
        }
         });
         var elems = document.querySelectorAll('select');
         M.FormSelect.init(elems);
 });

 function agregarPlatillo(platillo, id) {
    contenidoPlatillo += `<option value='${id}'>
    ${platillo.nombre} -  $${platillo.precio}
    </option>`;
    document.getElementById("listaPlatillo").innerHTML = contenidoPlatillo;
    }

const formularioPedido = document.getElementById("formPedido");
formularioPedido.addEventListener("submit", (e) => {
    e.preventDefault();
    const pedidoNuevo = {
        platillo: formularioPedido.listaPlatillo.value,
        nombre: formularioPedido.nombre.value,
        direccion: formularioPedido.direccion.value
    };

    db.collection("pedidos").add(pedidoNuevo)
    .then(() => {
        alert("Pedido realizado exitosamente");
        formularioPedido.reset();
    })
    .catch((error) => {
        console.log(error);
        alert("Error al realizar el pedido");
    });
});

document.getElementById("btnDireccion").addEventListener("click", function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(exito, error);
    }
    else {
        alert("La geolocalización no es compatible con este navegador.");
    }
});

function exito(posicion) {
    alert(posicion.coords.latitude + ", " + posicion.coords.longitude);
    let latitud = posicion.coords.latitude;
    let longitud = posicion.coords.longitude;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitud}&lon=${longitud}&format=json`, {
    headers: {
        'User-Agent': 'FoodOli (oliverten23@gmail.com)'
    }
  })
  .then(respuesta => respuesta.json())
  .then(data => {
    let ciudad = data.address.city;
    let pais = data.address.country;
    document.getElementById("direccion").innerHTML = `Ciudad: ${ciudad}, País: ${pais}`;
    var map = L.map('map').setView([latitud, longitud], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">'
    }).addTo(map);
    var marker = L.marker([latitud, longitud]).addTo(map);
    })
    .catch(error => console.error(error));
}

function error(error) {
    alert("Error al obtener la ubicación: " + error.message);
    console.log(error);
}