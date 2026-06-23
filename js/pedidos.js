db.collection("platillos").onSnapshot((datos) => {
     datos.docChanges().forEach((registro) => {
        if (registro.type === "added") {
            agregarPlatillo(registro.doc.data(), registro.doc.id);
        }
         });
 });