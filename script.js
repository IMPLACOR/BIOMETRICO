let datos = [];
let datosOrdenados = [];

async function cargarCSV() {

    try {

        const response = await fetch("registros.csv?nocache=" + new Date().getTime());
        const text = await response.text();

        datos = text.trim().split(/\r?\n/).map(line => line.split(","));

        let trabajadores = [...new Set(datos.slice(1).map(row => row[2] + " | ID:" + row[3]))];
        
        let select = document.getElementById("trabajadores");
        select.innerHTML = "";
        
        trabajadores.forEach(item => {
            let option = document.createElement("option");
            option.value = item;
            option.text = item;
            select.appendChild(option);
        });

        alert("CSV cargado correctamente");

    } catch (error) {
        alert("Error cargando CSV");
        console.error(error);
    }
}

let logs = [];

async function cargarLOG() {

    try {

        const response = await fetch("logs.csv?nocache=" + new Date().getTime());
        const text = await response.text();

        logs = text.trim().split(/\r?\n/).map(line => line.split(","));

        mostrarLogs();

        alert("Logs cargados correctamente");

    } catch (error) {
        alert("Error cargando logs");
        console.error(error);
    }
}
function procesar() {

let trabajador = document.getElementById("trabajadores").value;
let mesSeleccionado = document.getElementById("mes").value;
let idFiltro = document.getElementById("idFiltro").value;
let partes = trabajador.split("| ID:");
let nombreSeleccionado = partes[0].trim();
let idSeleccionado = partes[1]?.trim();
let registros = datos.slice(1).filter(row => {

    let partesFecha = row[0].split("/");
    let mes = partesFecha[1];

    let nombreOK = row[2] === nombreSeleccionado;
    let mesOK = mesSeleccionado === "" || mes === mesSeleccionado;

    let idOK;

    if (idFiltro !== "") {
        idOK = row[3] === idFiltro;
    } else {
        idOK = row[3] === idSeleccionado;
    }

    return nombreOK && mesOK && idOK;
});

    let agrupado = {};

    registros.forEach(row => {

        let fecha = row[0];
        let hora = row[1];

        if (!agrupado[fecha]) {
            agrupado[fecha] = [];
        }

        agrupado[fecha].push(hora);
    });

    datosOrdenados = [];

    let tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    for (let fecha in agrupado) {

        let turnos = ordenarTurnos(agrupado[fecha]);

        datosOrdenados.push(
            `${fecha},${turnos.IngresoA},${turnos.SalidaA},${turnos.IngresoB},${turnos.SalidaB}`
        );

        // 🔥 PINTAR EN TABLA
        let fila = `
            <tr>
                <td>${fecha}</td>
                <td>${turnos.IngresoA}</td>
                <td>${turnos.SalidaA}</td>
                <td>${turnos.IngresoB}</td>
                <td>${turnos.SalidaB}</td>
            </tr>
        `;

        tbody.innerHTML += fila;
    }

    alert("Datos procesados correctamente");
}

function ordenarTurnos(marcas) {

    marcas.sort((a, b) => a.localeCompare(b));

    let resultado = {
        IngresoA: "",
        SalidaA: "",
        IngresoB: "",
        SalidaB: ""
    };

    const LIMITE = "12:30";

    if (marcas.length === 1) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
        } else {
            resultado.IngresoB = marcas[0];
        }
    }

    else if (marcas.length === 2) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
            resultado.SalidaA  = marcas[1];
        } else {
            resultado.IngresoB = marcas[0];
            resultado.SalidaB  = marcas[1];
        }
    }

    else if (marcas.length === 3) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
            resultado.SalidaA  = marcas[1];
            resultado.IngresoB = marcas[2];
        } else {
            resultado.IngresoB = marcas[0];
            resultado.SalidaB  = marcas[1];
        }
    }

    else if (marcas.length >= 4) {

        resultado.IngresoA = marcas[0];
        resultado.SalidaA  = marcas[1];
        resultado.IngresoB = marcas[2];
        resultado.SalidaB  = marcas[3];
    }

    return resultado;
}

function descargar() {

    if (datosOrdenados.length === 0) {
        alert("Primero debes procesar los datos");
        return;
    }

    let trabajador = document.getElementById("trabajadores").value;

    // 🔥 Buscar el primer registro del trabajador
    let partes = trabajador.split("| ID:");
    let nombreSeleccionado = partes[0].trim();
    let idSeleccionado = partes[1]?.trim();
    
    let registro = datos.find(row => 
        row[2] === nombreSeleccionado && row[3] === idSeleccionado
    );

    if (!registro) {
        alert("No se encontró el PIN");
        return;
    }

    let pin = registro[4];  // ✅ columna 4

    let encabezado = "Fecha,IngresoA,SalidaA,IngresoB,SalidaB\n";
    let contenido = encabezado + datosOrdenados.join("\n");

    let blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);

    let link = document.createElement("a");
    link.href = url;

    // 🔥 Nombre solo con PIN
    link.download = `${pin}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

function mostrarLogs() {

    let tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    logs.slice(1).forEach(row => {

        let fila = `
            <tr>
                <td>${row[0]}</td>
                <td colspan="4">${row[2]}</td>
            </tr>
        `;

        tbody.innerHTML += fila;
    });
}
