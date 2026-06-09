db.collection("platillos").onSnapshot((coleccion) => {
     coleccion.forEach((registro) => {
          MostrarPlatillo(registro.data(), registro.id);
     });

  });