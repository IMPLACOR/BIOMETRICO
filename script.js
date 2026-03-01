let datos = [];
let datosOrdenados = [];

async function cargarCSV() {

    try {

        const response = await fetch("registros.csv?nocache=" + new Date().getTime());
        const text = await response.text();

        datos = text.trim().split("\n").map(line => line.split(","));

        let nombres = [...new Set(datos.slice(1).map(row => row[2]))];

        let select = document.getElementById("trabajadores");
        select.innerHTML = "";

        nombres.forEach(nombre => {
            let option = document.createElement("option");
            option.value = nombre;
            option.text = nombre;
            select.appendChild(option);
        });

        alert("CSV cargado correctamente");

    } catch (error) {
        alert("Error cargando CSV");
        console.error(error);
    }
}

function ordenar() {

    let nombre = document.getElementById("trabajadores").value;

    let registros = datos
        .slice(1)
        .filter(row => row[2] === nombre);

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

    Object.keys(agrupado).sort().forEach(fecha => {

        let horas = agrupado[fecha].sort();

        let ingreso  = horas[0] || "";
        let almuerzo = horas[1] || "";
        let retorno  = horas[2] || "";
        let salida   = horas[3] || "";

        datosOrdenados.push(`${fecha},${ingreso},${almuerzo},${retorno},${salida}`);

        let fila = `
        <tr>
        <td>${fecha}</td>
        <td>${ingreso}</td>
        <td>${almuerzo}</td>
        <td>${retorno}</td>
        <td>${salida}</td>
        </tr>`;

        tbody.innerHTML += fila;
    });
}

function descargar() {

    let encabezado = "Fecha,Ingreso,Almuerzo,Retorno,Salida\n";
    let contenido = encabezado + datosOrdenados.join("\n");

    let blob = new Blob([contenido], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ordenado.csv";
    link.click();
}
